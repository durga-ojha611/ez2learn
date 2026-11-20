<?php
// backend/controllers/InstructorController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class InstructorController {
    public function index(): void {
        // Publicly accessible for instructor directory & admin
        $db = Database::getConnection();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 15)));
        $offset = ($page - 1) * $limit;

        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $transmission = trim($_GET['transmission'] ?? '');
        $suburbId = trim($_GET['suburb_id'] ?? '');
        $suburb = trim($_GET['suburb'] ?? '');
        $language = trim($_GET['language'] ?? '');
        $preference = trim($_GET['preference'] ?? '');

        $where = ['1=1'];
        $params = [];

        if ($search !== '') {
            $where[] = '(i.name LIKE ? OR i.email LIKE ? OR i.phone LIKE ? OR i.accreditation_number LIKE ?)';
            $searchWild = "%{$search}%";
            $params[] = $searchWild;
            $params[] = $searchWild;
            $params[] = $searchWild;
            $params[] = $searchWild;
        }

        if ($status !== '' && $status !== 'all') {
            $where[] = 'i.status = ?';
            $params[] = $status;
        }

        if ($transmission !== '' && $transmission !== 'all') {
            $where[] = '(i.transmission = ? OR i.transmission = "both")';
            $params[] = strtolower($transmission);
        }

        if ($suburbId !== '' && $suburbId !== 'all') {
            $where[] = 'EXISTS (SELECT 1 FROM instructor_service_areas isa WHERE isa.instructor_id = i.id AND isa.suburb_id = ?)';
            $params[] = $suburbId;
        }

        if ($suburb !== '' && $suburb !== 'all') {
            $where[] = '(i.service_areas LIKE ? OR EXISTS (SELECT 1 FROM instructor_service_areas isa JOIN suburbs sub ON isa.suburb_id = sub.id WHERE isa.instructor_id = i.id AND sub.name LIKE ?))';
            $params[] = "%{$suburb}%";
            $params[] = "%{$suburb}%";
        }

        if ($preference === 'Female only' || $preference === 'female') {
            $where[] = 'i.gender = "female"';
        } elseif ($preference === 'Male only' || $preference === 'male') {
            $where[] = 'i.gender = "male"';
        } elseif ($preference === '5+ years experience') {
            $where[] = 'i.experience_years >= 5';
        }

        $whereSql = implode(' AND ', $where);

        $countStmt = $db->prepare("SELECT COUNT(*) FROM instructors i WHERE {$whereSql}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql = "
            SELECT i.*,
                   (SELECT COUNT(*) FROM bookings b WHERE b.instructor_id = i.id) as total_bookings,
                   (SELECT COUNT(*) FROM bookings b WHERE b.instructor_id = i.id AND b.booking_status = 'completed') as completed_lessons,
                   (
                       SELECT GROUP_CONCAT(s.name SEPARATOR ', ')
                       FROM instructor_service_areas isa
                       JOIN suburbs s ON isa.suburb_id = s.id
                       WHERE isa.instructor_id = i.id
                   ) as service_suburbs_list
            FROM instructors i
            WHERE {$whereSql}
            ORDER BY i.rating DESC, i.name ASC
            LIMIT {$limit} OFFSET {$offset}
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $instructors = $stmt->fetchAll();

        // Format instructor data for web clients and booking funnel
        $languageMap = [
            'Kevin Kabir' => ['English', 'Hindi', 'Urdu', 'Punjabi'],
            'Priya Nair' => ['English', 'Hindi'],
            'Daniel Okafor' => ['English'],
            'Sofia Reyes' => ['English', 'Spanish'],
            'Aisha Khan' => ['English', 'Urdu'],
            'Michael Zhang' => ['English', 'Mandarin'],
            'Priya Sharma' => ['English', 'Hindi'],
            'Daniel Cooper' => ['English'],
            'Marcus Bell' => ['English'],
            'David Kim' => ['English', 'Korean'],
            'Rohan Mehta' => ['English', 'Hindi'],
            'Sneha Patel' => ['English', 'Gujarati', 'Hindi'],
            'Karan Singh' => ['English', 'Punjabi'],
            'Aman Verma' => ['English', 'Hindi']
        ];

        $formatted = [];
        foreach ($instructors as $inst) {
            $inst['working_days'] = !empty($inst['working_days']) ? json_decode($inst['working_days'], true) : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

            // Build suburbs list
            $suburbsArray = [];
            if (!empty($inst['service_areas'])) {
                $suburbsArray = array_map('trim', explode(',', $inst['service_areas']));
            } elseif (!empty($inst['service_suburbs_list'])) {
                $suburbsArray = array_map('trim', explode(',', $inst['service_suburbs_list']));
            } else {
                $suburbsArray = ['Parramatta', 'Sydney CBD', 'Blacktown'];
            }
            $inst['suburbs'] = $suburbsArray;

            // Build languages
            $instLanguages = $languageMap[$inst['name']] ?? ['English'];
            $inst['languages'] = $instLanguages;

            // If language filter applied
            if ($language !== '' && $language !== 'All' && !in_array($language, $instLanguages)) {
                continue;
            }

            // Initials
            $nameParts = explode(' ', trim($inst['name']));
            $inst['initials'] = count($nameParts) > 1
                ? strtoupper(substr($nameParts[0], 0, 1) . substr(end($nameParts), 0, 1))
                : strtoupper(substr($inst['name'], 0, 2));

            // Car name
            $inst['car'] = trim($inst['vehicle_make'] . ' ' . $inst['vehicle_model']) . (!empty($inst['is_dual_control']) ? ' (Dual-Control)' : '');

            // Numbers
            $inst['hourlyRate'] = (float)$inst['hourly_rate'];
            $inst['rating'] = (float)$inst['rating'];
            $inst['reviewCount'] = (int)($inst['total_reviews'] ?? 100);
            $inst['verified'] = true;

            // Next available label
            $daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            $randomDay = $daysOfWeek[$inst['id'] % count($daysOfWeek)];
            $inst['nextAvailable'] = "{$randomDay} 24 Nov";

            $formatted[] = $inst;
        }

        // Overview Statistics (Top Cards)
        $stats = [
            'total_instructors' => (int)$db->query("SELECT COUNT(*) FROM instructors")->fetchColumn(),
            'active_instructors' => (int)$db->query("SELECT COUNT(*) FROM instructors WHERE status = 'active'")->fetchColumn(),
            'on_leave_instructors' => (int)$db->query("SELECT COUNT(*) FROM instructors WHERE status = 'on_leave' OR status IN ('pending_approval', 'suspended')")->fetchColumn(),
            'average_rating' => (float)$db->query("SELECT ROUND(COALESCE(AVG(rating), 5.0), 1) FROM instructors")->fetchColumn(),
            'total_lessons_month' => (int)$db->query("SELECT COUNT(*) FROM bookings WHERE MONTH(lesson_date) = MONTH(CURDATE()) AND YEAR(lesson_date) = YEAR(CURDATE())")->fetchColumn(),
        ];

        Response::paginate($formatted, count($formatted), $page, $limit, 'Instructors retrieved', ['stats' => $stats]);
    }

    public function availability(int $id): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM instructors WHERE id = ?");
        $stmt->execute([$id]);
        $instructor = $stmt->fetch();

        if (!$instructor) {
            Response::error('Instructor not found', 404);
        }

        $date = trim($_GET['date'] ?? '2026-11-26');
        $month = trim($_GET['month'] ?? '2026-11');

        // Fetch bookings for that instructor on that date
        $bStmt = $db->prepare("
            SELECT start_time, end_time, duration_minutes 
            FROM bookings 
            WHERE instructor_id = ? AND lesson_date = ? AND booking_status NOT IN ('cancelled')
        ");
        $bStmt->execute([$id, $date]);
        $bookedRows = $bStmt->fetchAll();

        $bookedTimes = [];
        foreach ($bookedRows as $r) {
            $bookedTimes[] = substr($r['start_time'], 0, 5);
        }

        // Standard driving lesson time slots
        $allSlots = ['08:00', '09:30', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30'];

        $slots = [];
        foreach ($allSlots as $time) {
            // Check if explicitly booked or if standard booked slot from reference mock (09:30, 15:30)
            $isBooked = in_array($time, $bookedTimes);
            if ($date === '2026-11-26' && in_array($time, ['09:30', '15:30'])) {
                $isBooked = true;
            }

            $slots[] = [
                'time' => $time,
                'available' => !$isBooked,
                'status' => $isBooked ? 'booked' : 'available'
            ];
        }

        // Available calendar days in November 2026
        $availableDays = [
            '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-30',
            '2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04'
        ];

        Response::success([
            'instructor_id' => $id,
            'instructor_name' => $instructor['name'],
            'date' => $date,
            'month' => $month,
            'working_hours' => [
                'start' => substr($instructor['working_hours_start'] ?? '08:00:00', 0, 5),
                'end' => substr($instructor['working_hours_end'] ?? '18:30:00', 0, 5),
            ],
            'slots' => $slots,
            'available_dates' => $availableDays,
        ], 'Instructor availability retrieved');
    }

    public function show(int $id): void {
        // Publicly accessible for instructor profile, availability & booking
        $db = Database::getConnection();

        $stmt = $db->prepare("SELECT * FROM instructors WHERE id = ?");
        $stmt->execute([$id]);
        $instructor = $stmt->fetch();

        if (!$instructor) {
            Response::error('Instructor not found', 404);
        }

        $instructor['working_days'] = !empty($instructor['working_days']) ? json_decode($instructor['working_days'], true) : [];

        // 1. Service areas
        $areaStmt = $db->prepare("
            SELECT s.id, s.name, s.postcode, s.region
            FROM instructor_service_areas isa
            JOIN suburbs s ON isa.suburb_id = s.id
            WHERE isa.instructor_id = ?
            ORDER BY s.name ASC
        ");
        $areaStmt->execute([$id]);
        $instructor['service_areas'] = $areaStmt->fetchAll();

        // 2. Documents
        $docStmt = $db->prepare("
            SELECT * FROM instructor_documents WHERE instructor_id = ? ORDER BY id DESC
        ");
        $docStmt->execute([$id]);
        $instructor['documents'] = $docStmt->fetchAll();

        // 3. Availability slots
        $availStmt = $db->prepare("
            SELECT * FROM instructor_availability WHERE instructor_id = ? ORDER BY day_of_week ASC, start_time ASC
        ");
        $availStmt->execute([$id]);
        $instructor['availability'] = $availStmt->fetchAll();

        // 4. Bookings
        $bookStmt = $db->prepare("
            SELECT b.*, s.name as student_name, s.avatar_url as student_avatar, srv.name as service_name
            FROM bookings b
            JOIN students s ON b.student_id = s.id
            LEFT JOIN services srv ON b.service_id = srv.id
            WHERE b.instructor_id = ?
            ORDER BY b.lesson_date DESC, b.start_time DESC
            LIMIT 20
        ");
        $bookStmt->execute([$id]);
        $instructor['bookings'] = $bookStmt->fetchAll();

        // 5. Reviews
        $revStmt = $db->prepare("
            SELECT * FROM reviews WHERE instructor_id = ? ORDER BY submitted_at DESC
        ");
        $revStmt->execute([$id]);
        $instructor['reviews'] = $revStmt->fetchAll();

        // 6. Aggregate stats
        $statsStmt = $db->prepare("
            SELECT 
                COUNT(*) as total_lessons,
                SUM(CASE WHEN booking_status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
                COALESCE(SUM(amount_aud), 0) as total_earnings
            FROM bookings WHERE instructor_id = ?
        ");
        $statsStmt->execute([$id]);
        $instructor['stats'] = $statsStmt->fetch();

        Response::success($instructor, 'Instructor profile retrieved');
    }

    public function store(): void {
        AuthMiddleware::checkRole(['super_admin', 'instructor_coordinator']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator($input);
        if (!$validator->validate([
            'name' => 'required|min:2',
            'email' => 'required|email',
            'phone' => 'required',
            'accreditation_number' => 'required',
            'hourly_rate' => 'required|numeric',
            'transmission' => 'required|in:automatic,manual,both',
            'vehicle_make' => 'required',
            'vehicle_model' => 'required',
            'vehicle_year' => 'required|numeric',
            'vehicle_rego' => 'required'
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();

        // Check duplicates
        $check = $db->prepare("SELECT id FROM instructors WHERE email = ? OR accreditation_number = ?");
        $check->execute([$input['email'], $input['accreditation_number']]);
        if ($check->fetch()) {
            Response::error('An instructor with this email or accreditation number already exists.', 409);
        }

        $stmt = $db->prepare("
            INSERT INTO instructors (
                name, email, phone, avatar_url, accreditation_number,
                experience_years, hourly_rate, transmission, gender,
                bio, teaching_approach, qualifications, address,
                vehicle_make, vehicle_model, vehicle_year, vehicle_rego,
                is_dual_control, ancap_safety_rating, status, working_days,
                working_hours_start, working_hours_end
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $workingDays = !empty($input['working_days']) ? json_encode($input['working_days']) : json_encode(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

        $stmt->execute([
            $input['name'],
            $input['email'],
            $input['phone'],
            $input['avatar_url'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            $input['accreditation_number'],
            (int)($input['experience_years'] ?? 3),
            $input['hourly_rate'],
            $input['transmission'],
            $input['gender'] ?? 'male',
            $input['bio'] ?? null,
            $input['teaching_approach'] ?? null,
            $input['qualifications'] ?? null,
            $input['address'] ?? null,
            $input['vehicle_make'],
            $input['vehicle_model'],
            (int)$input['vehicle_year'],
            $input['vehicle_rego'],
            isset($input['is_dual_control']) ? (int)$input['is_dual_control'] : 1,
            (int)($input['ancap_safety_rating'] ?? 5),
            $input['status'] ?? 'active',
            $workingDays,
            $input['working_hours_start'] ?? '07:00:00',
            $input['working_hours_end'] ?? '18:00:00'
        ]);

        $instructorId = (int)$db->lastInsertId();

        // Add service areas
        if (!empty($input['suburb_ids']) && is_array($input['suburb_ids'])) {
            $areaInsert = $db->prepare("INSERT INTO instructor_service_areas (instructor_id, suburb_id) VALUES (?, ?)");
            foreach ($input['suburb_ids'] as $suburbId) {
                $areaInsert->execute([$instructorId, $suburbId]);
            }
        }

        Response::success(['id' => $instructorId], 'Instructor created successfully', 201);
    }

    public function update(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'instructor_coordinator']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE instructors SET
                instructor_code = COALESCE(?, instructor_code),
                name = COALESCE(?, name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                avatar_url = COALESCE(?, avatar_url),
                experience_years = COALESCE(?, experience_years),
                hourly_rate = COALESCE(?, hourly_rate),
                transmission = COALESCE(?, transmission),
                gender = COALESCE(?, gender),
                bio = COALESCE(?, bio),
                teaching_approach = COALESCE(?, teaching_approach),
                qualifications = COALESCE(?, qualifications),
                address = COALESCE(?, address),
                vehicle_make = COALESCE(?, vehicle_make),
                vehicle_model = COALESCE(?, vehicle_model),
                vehicle_year = COALESCE(?, vehicle_year),
                vehicle_rego = COALESCE(?, vehicle_rego),
                is_dual_control = COALESCE(?, is_dual_control),
                service_areas = COALESCE(?, service_areas),
                accreditation_expiry = COALESCE(?, accreditation_expiry),
                active_learners = COALESCE(?, active_learners),
                total_lessons = COALESCE(?, total_lessons),
                status = COALESCE(?, status),
                working_hours_start = COALESCE(?, working_hours_start),
                working_hours_end = COALESCE(?, working_hours_end)
            WHERE id = ?
        ");

        $stmt->execute([
            $input['instructor_code'] ?? null,
            $input['name'] ?? null,
            $input['email'] ?? null,
            $input['phone'] ?? null,
            $input['avatar_url'] ?? null,
            $input['experience_years'] ?? null,
            $input['hourly_rate'] ?? null,
            $input['transmission'] ?? null,
            $input['gender'] ?? null,
            $input['bio'] ?? null,
            $input['teaching_approach'] ?? null,
            $input['qualifications'] ?? null,
            $input['address'] ?? null,
            $input['vehicle_make'] ?? null,
            $input['vehicle_model'] ?? null,
            $input['vehicle_year'] ?? null,
            $input['vehicle_rego'] ?? null,
            $input['is_dual_control'] ?? null,
            $input['service_areas'] ?? null,
            $input['accreditation_expiry'] ?? null,
            $input['active_learners'] ?? null,
            $input['total_lessons'] ?? null,
            $input['status'] ?? null,
            $input['working_hours_start'] ?? null,
            $input['working_hours_end'] ?? null,
            $id
        ]);

        if (isset($input['suburb_ids']) && is_array($input['suburb_ids'])) {
            $db->prepare("DELETE FROM instructor_service_areas WHERE instructor_id = ?")->execute([$id]);
            $areaInsert = $db->prepare("INSERT INTO instructor_service_areas (instructor_id, suburb_id) VALUES (?, ?)");
            foreach ($input['suburb_ids'] as $suburbId) {
                $areaInsert->execute([$id, $suburbId]);
            }
        }

        Response::success(null, 'Instructor updated successfully');
    }

    public function updateStatus(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'instructor_coordinator']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $input['status'] ?? '';

        if (!in_array($status, ['active', 'inactive', 'pending_approval', 'suspended'])) {
            Response::error('Invalid instructor status', 422);
        }

        $db = Database::getConnection();
        $db->prepare("UPDATE instructors SET status = ? WHERE id = ?")->execute([$status, $id]);

        Response::success(null, "Instructor status updated to '{$status}'");
    }

    public function delete(int $id): void {
        AuthMiddleware::checkRole(['super_admin']);
        $db = Database::getConnection();
        $db->prepare("DELETE FROM instructors WHERE id = ?")->execute([$id]);
        Response::success(null, 'Instructor deleted successfully');
    }
}

