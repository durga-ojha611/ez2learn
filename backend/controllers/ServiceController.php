<?php
// backend/controllers/ServiceController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class ServiceController {
    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $services = $db->query("
            SELECT s.*,
                   (SELECT COUNT(*) FROM bookings b WHERE b.service_id = s.id) as booking_count
            FROM services s
            ORDER BY s.sort_order ASC, s.id ASC
        ")->fetchAll();

        foreach ($services as &$srv) {
            $srv['included_features'] = !empty($srv['included_features']) ? json_decode($srv['included_features'], true) : [];
        }

        $packages = $db->query("
            SELECT p.*,
                   (SELECT COUNT(*) FROM bookings b WHERE b.package_id = p.id) as booking_count
            FROM packages p
            ORDER BY p.id ASC
        ")->fetchAll();

        foreach ($packages as &$pkg) {
            $pkg['features'] = !empty($pkg['features']) ? json_decode($pkg['features'], true) : [];
        }

        Response::success([
            'services' => $services,
            'packages' => $packages
        ], 'Services and packages retrieved');
    }

    public function storeService(): void {
        AuthMiddleware::checkRole(['super_admin']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator($input);
        if (!$validator->validate([
            'name' => 'required',
            'price_aud' => 'required|numeric',
            'duration_minutes' => 'required|numeric'
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['name'])));

        $stmt = $db->prepare("
            INSERT INTO services (name, slug, category, transmission, duration_minutes, price_aud, description, included_features, is_featured, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $input['name'],
            $slug . '-' . rand(10, 99),
            $input['category'] ?? 'standard',
            $input['transmission'] ?? 'both',
            (int)$input['duration_minutes'],
            $input['price_aud'],
            $input['description'] ?? null,
            !empty($input['included_features']) ? json_encode($input['included_features']) : null,
            isset($input['is_featured']) ? (int)$input['is_featured'] : 0,
            isset($input['is_active']) ? (int)$input['is_active'] : 1
        ]);

        Response::success(['id' => $db->lastInsertId()], 'Service created', 201);
    }

    public function updateService(int $id): void {
        AuthMiddleware::checkRole(['super_admin']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE services SET
                name = COALESCE(?, name),
                category = COALESCE(?, category),
                transmission = COALESCE(?, transmission),
                duration_minutes = COALESCE(?, duration_minutes),
                price_aud = COALESCE(?, price_aud),
                description = COALESCE(?, description),
                included_features = COALESCE(?, included_features),
                is_featured = COALESCE(?, is_featured),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
        ");

        $features = isset($input['included_features']) ? json_encode($input['included_features']) : null;

        $stmt->execute([
            $input['name'] ?? null,
            $input['category'] ?? null,
            $input['transmission'] ?? null,
            $input['duration_minutes'] ?? null,
            $input['price_aud'] ?? null,
            $input['description'] ?? null,
            $features,
            $input['is_featured'] ?? null,
            $input['is_active'] ?? null,
            $id
        ]);

        Response::success(null, 'Service updated successfully');
    }

    public function deleteService(int $id): void {
        AuthMiddleware::checkRole(['super_admin']);
        $db = Database::getConnection();
        $db->prepare("DELETE FROM services WHERE id = ?")->execute([$id]);
        Response::success(null, 'Service deleted');
    }

    public function storePackage(): void {
        AuthMiddleware::checkRole(['super_admin']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['name'] ?? 'Package')));

        $stmt = $db->prepare("
            INSERT INTO packages (name, slug, lesson_count, duration_per_lesson, price_aud, discount_amount, popular_badge, description, features, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $input['name'],
            $slug . '-' . rand(10, 99),
            (int)($input['lesson_count'] ?? 5),
            (int)($input['duration_per_lesson'] ?? 60),
            $input['price_aud'],
            $input['discount_amount'] ?? 0.00,
            isset($input['popular_badge']) ? (int)$input['popular_badge'] : 0,
            $input['description'] ?? null,
            !empty($input['features']) ? json_encode($input['features']) : null,
            isset($input['is_active']) ? (int)$input['is_active'] : 1
        ]);

        Response::success(['id' => $db->lastInsertId()], 'Package created successfully', 201);
    }

    public function updatePackage(int $id): void {
        AuthMiddleware::checkRole(['super_admin']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE packages SET
                name = COALESCE(?, name),
                lesson_count = COALESCE(?, lesson_count),
                duration_per_lesson = COALESCE(?, duration_per_lesson),
                price_aud = COALESCE(?, price_aud),
                discount_amount = COALESCE(?, discount_amount),
                popular_badge = COALESCE(?, popular_badge),
                description = COALESCE(?, description),
                features = COALESCE(?, features),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
        ");

        $features = isset($input['features']) ? json_encode($input['features']) : null;

        $stmt->execute([
            $input['name'] ?? null,
            $input['lesson_count'] ?? null,
            $input['duration_per_lesson'] ?? null,
            $input['price_aud'] ?? null,
            $input['discount_amount'] ?? null,
            $input['popular_badge'] ?? null,
            $input['description'] ?? null,
            $features,
            $input['is_active'] ?? null,
            $id
        ]);

        Response::success(null, 'Package updated successfully');
    }

    public function deletePackage(int $id): void {
        AuthMiddleware::checkRole(['super_admin']);
        $db = Database::getConnection();
        $db->prepare("DELETE FROM packages WHERE id = ?")->execute([$id]);
        Response::success(null, 'Package deleted');
    }
}

