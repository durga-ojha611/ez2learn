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
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, (int)($_GET['limit'] ?? 5));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT * FROM inquiries WHERE 1=1";
        $countSql = "SELECT COUNT(*) FROM inquiries WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $clause = " AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR suburb LIKE ? OR message LIKE ? OR COALESCE(subject, '') LIKE ?)";
            $sql .= $clause;
            $countSql .= $clause;
            $term = "%{$search}%";
            $params = array_merge($params, [$term, $term, $term, $term, $term, $term]);
        }

        if (!empty($status) && $status !== 'all') {
            $clause = " AND status = ?";
            $sql .= $clause;
            $countSql .= $clause;
            $params[] = $status;
        }

        if (!empty($lessonType) && $lessonType !== 'all') {
            $clause = " AND lesson_type = ?";
            $sql .= $clause;
            $countSql .= $clause;
            $params[] = $lessonType;
        }

        // Count total matching
        $countStmt = $db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        // Fetch paginated
        $sql .= " ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $inquiries = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Stats
        $stats = [
            'total' => (int)$db->query("SELECT COUNT(*) FROM inquiries")->fetchColumn(),
            'new' => (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'new'")->fetchColumn(),
            'replied' => (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'replied'")->fetchColumn(),
            'contacted' => (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'contacted'")->fetchColumn(),
            'converted' => (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'converted'")->fetchColumn(),
            'closed' => (int)$db->query("SELECT COUNT(*) FROM inquiries WHERE status = 'closed'")->fetchColumn(),
        ];

        Response::success([
            'inquiries' => $inquiries,
            'stats' => $stats,
            'pagination' => [
                'current_page' => $page,
                'limit' => $limit,
                'total_items' => $total,
                'total_pages' => max(1, (int)ceil($total / $limit)),
            ]
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
                name, subject, email, phone, suburb, lesson_type, message, status, preferred_date, preferred_time, notes, assigned_to
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        ");

        $status = $input['status'] ?? 'new';
        $subject = $input['subject'] ?? ($input['lesson_type'] ?? 'Driving Lesson Query');
        $suburb = $input['suburb'] ?? 'Parramatta';
        $lessonType = $input['lesson_type'] ?? 'Automatic Driving Lessons';
        $message = $input['message'] ?? '';
        $prefDate = !empty($input['preferred_date']) ? $input['preferred_date'] : null;
        $prefTime = $input['preferred_time'] ?? 'Morning';
        $notes = $input['notes'] ?? null;
        $assignedTo = $input['assigned_to'] ?? 'Kevin O\'Connor';

        $stmt->execute([
            $input['name'],
            $subject,
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
                subject = COALESCE(?, subject),
                status = COALESCE(?, status),
                notes = COALESCE(?, notes),
                assigned_to = COALESCE(?, assigned_to),
                suburb = COALESCE(?, suburb),
                lesson_type = COALESCE(?, lesson_type),
                preferred_date = COALESCE(?, preferred_date),
                preferred_time = COALESCE(?, preferred_time),
                message = COALESCE(?, message)
            WHERE id = ?
        ");

        $stmt->execute([
            $input['subject'] ?? null,
            $input['status'] ?? null,
            $input['notes'] ?? null,
            $input['assigned_to'] ?? null,
            $input['suburb'] ?? null,
            $input['lesson_type'] ?? null,
            $input['preferred_date'] ?? null,
            $input['preferred_time'] ?? null,
            $input['message'] ?? null,
            $id
        ]);

        Response::success(null, 'Inquiry updated successfully');
    }

    public function reply(int $id): void {
        AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $replyMessage = trim($input['reply_message'] ?? $input['message'] ?? '');

        if (empty($replyMessage)) {
            Response::error('Reply message cannot be empty', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM inquiries WHERE id = ?");
        $stmt->execute([$id]);
        $inquiry = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$inquiry) {
            Response::error('Inquiry not found', 404);
        }

        $timestamp = date('d M Y, h:i A');
        $updatedNotes = trim(($inquiry['notes'] ? $inquiry['notes'] . "\n\n" : "") . "[Replied on {$timestamp}]: " . $replyMessage);

        $updateStmt = $db->prepare("
            UPDATE inquiries SET
                status = 'replied',
                notes = ?
            WHERE id = ?
        ");
        $updateStmt->execute([$updatedNotes, $id]);

        Response::success([
            'id' => $id,
            'status' => 'replied',
            'notes' => $updatedNotes,
            'replied_at' => $timestamp
        ], 'Reply sent successfully and inquiry marked as Replied');
    }

    public function delete(int $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare("DELETE FROM inquiries WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(null, 'Inquiry deleted successfully');
    }
}
