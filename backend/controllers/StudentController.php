<?php
// backend/controllers/StudentController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class StudentController {
    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 15)));
        $offset = ($page - 1) * $limit;

        $search = trim($_GET['search'] ?? '');
        $licenceStage = trim($_GET['licence_stage'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $suburb = trim($_GET['suburb'] ?? '');
        $instructorId = trim($_GET['instructor_id'] ?? '');

        $where = ['1=1'];
        $params = [];

        if ($search !== '') {
            $numOnly = ltrim(preg_replace('/[^0-9]/', '', $search), '0');
            if ($numOnly !== '') {
                $where[] = '(s.name LIKE ? OR s.email LIKE ? OR s.phone LIKE ? OR s.licence_number LIKE ? OR s.id = ?)';
                $searchWild = "%{$search}%";
                $params[] = $searchWild;
                $params[] = $searchWild;
                $params[] = $searchWild;
                $params[] = $searchWild;
                $params[] = (int)$numOnly;
            } else {
                $where[] = '(s.name LIKE ? OR s.email LIKE ? OR s.phone LIKE ? OR s.licence_number LIKE ?)';
                $searchWild = "%{$search}%";
                $params[] = $searchWild;
                $params[] = $searchWild;
                $params[] = $searchWild;
                $params[] = $searchWild;
            }
        }

        if ($licenceStage !== '' && $licenceStage !== 'all') {
            $where[] = 's.licence_stage = ?';
            $params[] = $licenceStage;
        }

        if ($status !== '' && $status !== 'all') {
            $where[] = 's.status = ?';
            $params[] = $status;
        }

        if ($suburb !== '' && $suburb !== 'all') {
            $where[] = 's.suburb = ?';
            $params[] = $suburb;
        }

        if ($instructorId !== '' && $instructorId !== 'all') {
            $where[] = 's.preferred_instructor_id = ?';
            $params[] = (int)$instructorId;
        }

        $whereSql = implode(' AND ', $where);

        $countStmt = $db->prepare("SELECT COUNT(*) FROM students s WHERE {$whereSql}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql = "
            SELECT s.*,
                   i.name as preferred_instructor_name,
                   (SELECT COUNT(*) FROM bookings b WHERE b.student_id = s.id) as total_bookings,
                   (SELECT COUNT(*) FROM bookings b WHERE b.student_id = s.id AND b.booking_status = 'completed') as completed_lessons_count,
                   (SELECT COALESCE(SUM(amount_aud), 0) FROM payments p WHERE p.student_id = s.id AND p.payment_status = 'paid') as total_paid
            FROM students s
            LEFT JOIN instructors i ON s.preferred_instructor_id = i.id
            WHERE {$whereSql}
            ORDER BY s.id DESC
            LIMIT {$limit} OFFSET {$offset}
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $students = $stmt->fetchAll();

        // 1. Overview Statistics (Top Cards)
        $stats = [
            'total_students' => (int)$db->query("SELECT COUNT(*) FROM students")->fetchColumn(),
            'active_students' => (int)$db->query("SELECT COUNT(*) FROM students WHERE status = 'active'")->fetchColumn(),
            'new_students_month' => (int)$db->query("SELECT COUNT(*) FROM students WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())")->fetchColumn(),
            'students_upcoming_lessons' => (int)$db->query("SELECT COUNT(DISTINCT student_id) FROM bookings WHERE lesson_date >= CURDATE() AND booking_status NOT IN ('cancelled', 'completed')")->fetchColumn(),
        ];

        Response::paginate($students, $total, $page, $limit, 'Students retrieved', ['stats' => $stats]);
    }

    public function show(int $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT s.*,
                   i.name as preferred_instructor_name, i.avatar_url as preferred_instructor_avatar, i.phone as preferred_instructor_phone
            FROM students s
            LEFT JOIN instructors i ON s.preferred_instructor_id = i.id
            WHERE s.id = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $student = $stmt->fetch();

        if (!$student) {
            Response::error('Student not found', 404);
        }

        // Bookings
        $bookStmt = $db->prepare("
            SELECT b.*, i.name as instructor_name, i.phone as instructor_phone, srv.name as service_name
            FROM bookings b
            LEFT JOIN instructors i ON b.instructor_id = i.id
            LEFT JOIN services srv ON b.service_id = srv.id
            WHERE b.student_id = ?
            ORDER BY b.lesson_date DESC, b.start_time DESC
        ");
        $bookStmt->execute([$id]);
        $student['bookings'] = $bookStmt->fetchAll();

        // Payments
        $payStmt = $db->prepare("
            SELECT * FROM payments WHERE student_id = ? ORDER BY paid_at DESC
        ");
        $payStmt->execute([$id]);
        $student['payments'] = $payStmt->fetchAll();

        // Additional Profile Info
        $student['total_paid'] = (float)$db->query("SELECT COALESCE(SUM(amount_aud), 0) FROM payments WHERE student_id = " . (int)$id . " AND payment_status = 'paid'")->fetchColumn();
        $student['pending_payments'] = (float)$db->query("SELECT COALESCE(SUM(amount_aud), 0) FROM payments WHERE student_id = " . (int)$id . " AND payment_status = 'pending'")->fetchColumn();
        $student['upcoming_bookings_count'] = (int)$db->query("SELECT COUNT(*) FROM bookings WHERE student_id = " . (int)$id . " AND lesson_date >= CURDATE() AND booking_status NOT IN ('cancelled', 'completed')")->fetchColumn();
        $student['cancelled_bookings_count'] = (int)$db->query("SELECT COUNT(*) FROM bookings WHERE student_id = " . (int)$id . " AND booking_status = 'cancelled'")->fetchColumn();
        $student['last_lesson_date'] = $db->query("SELECT MAX(lesson_date) FROM bookings WHERE student_id = " . (int)$id . " AND booking_status = 'completed'")->fetchColumn() ?: null;

        // Calculate logbook progress (Transport for NSW standard: 120 total logbook hours for learners under 25, 20 night hours)
        $completedLessons = (int)$student['completed_lessons'];
        $instructorHours = (float)$student['recorded_instructor_hours'];
        $nswBonusHours = (float)$student['nsw_logbook_hours']; // up to 30 hours from 10 pro hours (3-for-1)
        $targetHours = 120.0;

        $student['logbook_analytics'] = [
            'target_hours' => $targetHours,
            'recorded_instructor_hours' => $instructorHours,
            'nsw_3_for_1_bonus_hours' => $nswBonusHours,
            'max_bonus_cap' => 30.0,
            'bonus_cap_reached' => $nswBonusHours >= 30.0,
            'progress_percent' => min(100, round(($nswBonusHours / $targetHours) * 100, 1))
        ];

        Response::success($student, 'Student profile details retrieved');
    }

    public function store(): void {
        AuthMiddleware::checkRole(['super_admin', 'booking_manager']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator($input);
        if (!$validator->validate([
            'name' => 'required|min:2',
            'email' => 'required|email',
            'phone' => 'required',
            'suburb' => 'required',
            'postcode' => 'required'
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();

        $check = $db->prepare("SELECT id FROM students WHERE email = ?");
        $check->execute([$input['email']]);
        if ($check->fetch()) {
            Response::error('A student with this email already exists.', 409);
        }

        $stmt = $db->prepare("
            INSERT INTO students (
                student_code, name, first_name, last_name, email, phone, date_of_birth, avatar_url, address, suburb, postcode,
                licence_number, licence_stage, licence_status, preferred_transmission,
                preferred_instructor_id, learning_objective, remaining_lessons, pending_payments, emergency_contact_name,
                emergency_contact_phone, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $firstName = !empty($input['first_name']) ? $input['first_name'] : explode(' ', $input['name'])[0];
        $lastName = !empty($input['last_name']) ? $input['last_name'] : (count(explode(' ', $input['name'])) > 1 ? explode(' ', $input['name'])[1] : '');
        $studentCode = !empty($input['student_code']) ? $input['student_code'] : 'STU-' . rand(100, 999);

        $stmt->execute([
            $studentCode,
            $input['name'],
            $firstName,
            $lastName,
            $input['email'],
            $input['phone'],
            !empty($input['date_of_birth']) ? $input['date_of_birth'] : null,
            $input['avatar_url'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            $input['address'] ?? null,
            $input['suburb'],
            $input['postcode'],
            $input['licence_number'] ?? null,
            $input['licence_stage'] ?? 'learner',
            $input['licence_status'] ?? 'Valid',
            $input['preferred_transmission'] ?? 'automatic',
            !empty($input['preferred_instructor_id']) ? (int)$input['preferred_instructor_id'] : null,
            $input['learning_objective'] ?? 'Pass NSW Driving Test',
            (int)($input['remaining_lessons'] ?? 0),
            (float)($input['pending_payments'] ?? 0.0),
            $input['emergency_contact_name'] ?? null,
            $input['emergency_contact_phone'] ?? null,
            $input['status'] ?? 'active'
        ]);

        $studentId = (int)$db->lastInsertId();
        Response::success(['id' => $studentId], 'Student registered successfully', 201);
    }

    public function update(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'booking_manager']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE students SET
                student_code = COALESCE(?, student_code),
                name = COALESCE(?, name),
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                date_of_birth = COALESCE(?, date_of_birth),
                address = COALESCE(?, address),
                suburb = COALESCE(?, suburb),
                postcode = COALESCE(?, postcode),
                licence_number = COALESCE(?, licence_number),
                licence_stage = COALESCE(?, licence_stage),
                licence_status = COALESCE(?, licence_status),
                preferred_transmission = COALESCE(?, preferred_transmission),
                preferred_instructor_id = COALESCE(?, preferred_instructor_id),
                learning_objective = COALESCE(?, learning_objective),
                remaining_lessons = COALESCE(?, remaining_lessons),
                pending_payments = COALESCE(?, pending_payments),
                emergency_contact_name = COALESCE(?, emergency_contact_name),
                emergency_contact_phone = COALESCE(?, emergency_contact_phone),
                status = COALESCE(?, status)
            WHERE id = ?
        ");

        $stmt->execute([
            $input['student_code'] ?? null,
            $input['name'] ?? null,
            $input['first_name'] ?? null,
            $input['last_name'] ?? null,
            $input['email'] ?? null,
            $input['phone'] ?? null,
            $input['date_of_birth'] ?? null,
            $input['address'] ?? null,
            $input['suburb'] ?? null,
            $input['postcode'] ?? null,
            $input['licence_number'] ?? null,
            $input['licence_stage'] ?? null,
            $input['licence_status'] ?? null,
            $input['preferred_transmission'] ?? null,
            isset($input['preferred_instructor_id']) ? ($input['preferred_instructor_id'] ?: null) : null,
            $input['learning_objective'] ?? null,
            $input['remaining_lessons'] ?? null,
            $input['pending_payments'] ?? null,
            $input['emergency_contact_name'] ?? null,
            $input['emergency_contact_phone'] ?? null,
            $input['status'] ?? null,
            $id
        ]);

        Response::success(null, 'Student information updated');
    }

    public function delete(int $id): void {
        AuthMiddleware::checkRole(['super_admin']);
        $db = Database::getConnection();
        $db->prepare("DELETE FROM students WHERE id = ?")->execute([$id]);
        Response::success(null, 'Student deleted');
    }
}

