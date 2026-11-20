<?php
// backend/controllers/LocationController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class LocationController {
    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $suburbs = $db->query("
            SELECT s.*, c.name as city_name, st.code as state_code,
                   (
                       SELECT COUNT(*) 
                       FROM instructor_service_areas isa 
                       WHERE isa.suburb_id = s.id
                   ) as assigned_instructors_count,
                   (
                       SELECT COUNT(*) 
                       FROM bookings b 
                       WHERE b.pickup_suburb = s.name
                   ) as total_bookings_count
            FROM suburbs s
            JOIN cities c ON s.city_id = c.id
            JOIN states st ON c.state_id = st.id
            ORDER BY s.region ASC, s.name ASC
        ")->fetchAll();

        // Group by Region
        $byRegion = [];
        foreach ($suburbs as $sub) {
            $byRegion[$sub['region']][] = $sub;
        }

        $cities = $db->query("SELECT id, name FROM cities WHERE is_active = 1")->fetchAll();

        Response::success([
            'suburbs' => $suburbs,
            'grouped_by_region' => $byRegion,
            'cities' => $cities
        ], 'Locations retrieved');
    }

    public function getSuburbsList(): void {
        $db = Database::getConnection();
        $suburbs = $db->query("
            SELECT s.id, s.name, s.postcode, s.region
            FROM suburbs s
            WHERE s.is_active = 1
            ORDER BY s.region ASC, s.name ASC
        ")->fetchAll(PDO::FETCH_ASSOC);

        Response::success($suburbs, 'Suburbs list retrieved');
    }

    public function getInstructorsBySuburb(int $suburbId): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT i.id, i.name, i.email, i.phone, i.avatar_url, i.rating, i.transmission, i.hourly_rate, i.status
            FROM instructors i
            JOIN instructor_service_areas isa ON i.id = isa.instructor_id
            WHERE isa.suburb_id = ?
            ORDER BY i.rating DESC
        ");
        $stmt->execute([$suburbId]);
        $instructors = $stmt->fetchAll();

        Response::success($instructors, 'Instructors serving this suburb');
    }

    public function storeSuburb(): void {
        AuthMiddleware::checkRole(['super_admin', 'instructor_coordinator']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator($input);
        if (!$validator->validate([
            'name' => 'required',
            'postcode' => 'required',
            'region' => 'required'
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();
        $cityId = !empty($input['city_id']) ? (int)$input['city_id'] : 1;

        $stmt = $db->prepare("
            INSERT INTO suburbs (city_id, name, postcode, region, is_active)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $cityId,
            $input['name'],
            $input['postcode'],
            $input['region'],
            isset($input['is_active']) ? (int)$input['is_active'] : 1
        ]);

        $suburbId = (int)$db->lastInsertId();

        // Assign instructors if provided
        if (!empty($input['instructor_ids']) && is_array($input['instructor_ids'])) {
            $insStmt = $db->prepare("INSERT IGNORE INTO instructor_service_areas (instructor_id, suburb_id) VALUES (?, ?)");
            foreach ($input['instructor_ids'] as $instId) {
                $insStmt->execute([$instId, $suburbId]);
            }
        }

        Response::success(['id' => $suburbId], 'Suburb created successfully', 201);
    }

    public function updateSuburb(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'instructor_coordinator']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE suburbs SET
                name = COALESCE(?, name),
                postcode = COALESCE(?, postcode),
                region = COALESCE(?, region),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
        ");
        $stmt->execute([
            $input['name'] ?? null,
            $input['postcode'] ?? null,
            $input['region'] ?? null,
            $input['is_active'] ?? null,
            $id
        ]);

        // Reassign instructors if provided
        if (isset($input['instructor_ids']) && is_array($input['instructor_ids'])) {
            $db->prepare("DELETE FROM instructor_service_areas WHERE suburb_id = ?")->execute([$id]);
            $insStmt = $db->prepare("INSERT INTO instructor_service_areas (instructor_id, suburb_id) VALUES (?, ?)");
            foreach ($input['instructor_ids'] as $instId) {
                $insStmt->execute([$instId, $id]);
            }
        }

        Response::success(null, 'Suburb updated successfully');
    }

    public function toggleStatus(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'instructor_coordinator']);
        $db = Database::getConnection();
        $db->prepare("UPDATE suburbs SET is_active = NOT is_active WHERE id = ?")->execute([$id]);
        Response::success(null, 'Suburb status toggled');
    }

    public function deleteSuburb(int $id): void {
        AuthMiddleware::checkRole(['super_admin']);
        $db = Database::getConnection();
        
        // Check dependent bookings
        $stmt = $db->prepare("SELECT COUNT(*) FROM suburbs s JOIN bookings b ON b.pickup_suburb = s.name WHERE s.id = ?");
        $stmt->execute([$id]);
        $bookingsCount = (int)$stmt->fetchColumn();

        if ($bookingsCount > 0) {
            Response::error("Cannot delete location because {$bookingsCount} existing lesson bookings depend on it. Please deactivate the location instead.", 400);
        }

        $db->prepare("DELETE FROM instructor_service_areas WHERE suburb_id = ?")->execute([$id]);
        $db->prepare("DELETE FROM suburbs WHERE id = ?")->execute([$id]);

        Response::success(null, 'Location deleted successfully');
    }
}

