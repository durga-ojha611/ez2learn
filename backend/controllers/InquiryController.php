<?php
// backend/controllers/InquiryController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class InquiryController {
    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $lessonType = $_GET['lesson_type'] ?? '';

        $sql = "SELECT * FROM inquiries WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR suburb LIKE ? OR message LIKE ?)";
            $term = "%{$search}%";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        if (!empty($status) && $status !== 'all') {
            $sql .= " AND status = ?";
            $params[] = $status;
        }

        if (!empty($lessonType) && $lessonType !== 'all') {
            $sql .= " AND lesson_type = ?";
            $params[] = $lessonType;
        }

        $sql .= " ORDER BY id DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $inquiries = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Stats
        $stats = [
            'total' => (int)$db->query("SELECT COUNT(*) FROM inquiries")->fetchColumn(),
            'new' => (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'new'")->fetchColumn(),
            'contacted' => (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'contacted'")->fetchColumn(),
            'converted' => (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'converted'")->fetchColumn(),
            'closed' => (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'closed'")->fetchColumn(),
        ];

        Response::success([
            'inquiries' => $inquiries,
            'stats' => $stats
        ], 'Inquiries retrieved successfully');
    }

    public function show(int $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare("SELECT * FROM inquiries WHERE id = ?");
        $stmt->execute([$id]);
        $inquiry = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$inquiry) {
            Response::error('Inquiry not found', 404);
        }

        Response::success($inquiry, 'Inquiry retrieved');
    }

    public function store(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator($input);
        if (!$validator->validate([
            'name' => 'required',
            'email' => 'required|email',
            'phone' => 'required'
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO inquiries (
                name, email, phone, suburb, lesson_type, message, status, preferred_date, preferred_time, notes, assigned_to
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        ");

        $status = in_array($input['status'] ?? '', ['new', 'contacted', 'converted', 'closed']) ? $input['status'] : 'new';
        $suburb = $input['suburb'] ?? 'Parramatta';
        $lessonType = $input['lesson_type'] ?? 'Automatic Driving Lessons';
        $message = $input['message'] ?? '';
        $prefDate = !empty($input['preferred_date']) ? $input['preferred_date'] : null;
        $prefTime = $input['preferred_time'] ?? 'Morning';
        $notes = $input['notes'] ?? null;
        $assignedTo = $input['assigned_to'] ?? 'Kevin O\'Connor';

        $stmt->execute([
            $input['name'],
            $input['email'],
            $input['phone'],
            $suburb,
            $lessonType,
            $message,
            $status,
            $prefDate,
            $prefTime,
            $notes,
            $assignedTo
        ]);

        Response::success(['id' => $db->lastInsertId()], 'Inquiry submitted successfully', 201);
    }

    public function update(int $id): void {
        AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE inquiries SET
                status = COALESCE(?, status),
                notes = COALESCE(?, notes),
                assigned_to = COALESCE(?, assigned_to),
                suburb = COALESCE(?, suburb),
                lesson_type = COALESCE(?, lesson_type),
                preferred_date = COALESCE(?, preferred_date),
                preferred_time = COALESCE(?, preferred_time)
            WHERE id = ?
        ");

        $stmt->execute([
            $input['status'] ?? null,
            $input['notes'] ?? null,
            $input['assigned_to'] ?? null,
            $input['suburb'] ?? null,
            $input['lesson_type'] ?? null,
            $input['preferred_date'] ?? null,
            $input['preferred_time'] ?? null,
            $id
        ]);

        Response::success(null, 'Inquiry updated successfully');
    }

    public function delete(int $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare("DELETE FROM inquiries WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(null, 'Inquiry deleted successfully');
    }
}
