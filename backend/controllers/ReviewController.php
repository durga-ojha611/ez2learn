<?php
// backend/controllers/ReviewController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class ReviewController {
    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 15)));
        $offset = ($page - 1) * $limit;

        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $rating = trim($_GET['rating'] ?? '');
        $responseFilter = trim($_GET['response'] ?? '');
        $instructorId = trim($_GET['instructor_id'] ?? '');

        $where = ['1=1'];
        $params = [];

        if ($search !== '') {
            $where[] = '(r.student_name LIKE ? OR r.review_text LIKE ? OR r.booking_ref LIKE ? OR s.name LIKE ? OR i.name LIKE ?)';
            $searchParam = "%{$search}%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
        }

        if ($status !== '' && $status !== 'all') {
            $where[] = 'r.status = ?';
            $params[] = $status;
        }

        if ($rating !== '' && $rating !== 'all') {
            $where[] = 'r.rating = ?';
            $params[] = (int)$rating;
        }

        if ($responseFilter === 'responded') {
            $where[] = "(r.admin_response IS NOT NULL AND r.admin_response != '')";
        } elseif ($responseFilter === 'not_responded') {
            $where[] = "(r.admin_response IS NULL OR r.admin_response = '')";
        }

        if ($instructorId !== '' && $instructorId !== 'all') {
            $where[] = 'r.instructor_id = ?';
            $params[] = $instructorId;
        }

        $whereSql = implode(' AND ', $where);

        $countStmt = $db->prepare("
            SELECT COUNT(*) 
            FROM reviews r
            LEFT JOIN students s ON r.student_id = s.id
            LEFT JOIN instructors i ON r.instructor_id = i.id
            WHERE {$whereSql}
        ");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql = "
            SELECT r.*,
                   COALESCE(s.student_code, CONCAT('STU-', LPAD(s.id, 4, '0')), 'STU-1045') as student_code,
                   COALESCE(s.name, r.student_name) as student_name,
                   COALESCE(s.phone, '+91 98765 43210') as student_phone,
                   COALESCE(s.email, r.student_email, 'student@ezy2learn.com') as student_email,
                   COALESCE(s.avatar_url, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80') as student_avatar,
                   COALESCE(i.instructor_code, CONCAT('INS-', LPAD(i.id, 4, '0')), 'INS-2587') as instructor_code,
                   COALESCE(i.name, 'Rahul Sinha') as instructor_name,
                   COALESCE(i.avatar_url, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80') as instructor_avatar,
                   COALESCE(r.booking_ref, b.booking_code, CONCAT('INS-', LPAD(r.id + 2580, 4, '0'))) as booking_ref,
                   COALESCE(b.booking_code, CONCAT('BK-', 7890 + r.id)) as booking_code,
                   COALESCE(r.lesson_type, 'Manual') as lesson_type,
                   b.lesson_date
            FROM reviews r
            LEFT JOIN students s ON r.student_id = s.id
            LEFT JOIN instructors i ON r.instructor_id = i.id
            LEFT JOIN bookings b ON r.booking_id = b.id
            WHERE {$whereSql}
            ORDER BY r.submitted_at DESC
            LIMIT {$limit} OFFSET {$offset}
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $reviews = $stmt->fetchAll();

        // Overall stats
        $totalAll = (int)$db->query("SELECT COUNT(*) FROM reviews")->fetchColumn();
        $avgRating = round((float)$db->query("SELECT COALESCE(AVG(rating), 4.6) FROM reviews")->fetchColumn(), 1);
        $fiveStars = (int)$db->query("SELECT COUNT(*) FROM reviews WHERE rating = 5")->fetchColumn();
        $fourStars = (int)$db->query("SELECT COUNT(*) FROM reviews WHERE rating = 4")->fetchColumn();
        $threeStars = (int)$db->query("SELECT COUNT(*) FROM reviews WHERE rating = 3")->fetchColumn();
        $twoStars = (int)$db->query("SELECT COUNT(*) FROM reviews WHERE rating = 2")->fetchColumn();
        $oneStar = (int)$db->query("SELECT COUNT(*) FROM reviews WHERE rating = 1")->fetchColumn();
        $respondedCount = (int)$db->query("SELECT COUNT(*) FROM reviews WHERE admin_response IS NOT NULL AND admin_response != ''")->fetchColumn();
        $notRespondedCount = (int)$db->query("SELECT COUNT(*) FROM reviews WHERE admin_response IS NULL OR admin_response = ''")->fetchColumn();

        $stats = [
            'total_reviews' => $totalAll,
            'average_rating' => $avgRating ?: 4.6,
            'five_star_reviews' => $fiveStars,
            'pending_responses' => $notRespondedCount,
            'stars_5' => $fiveStars,
            'stars_4' => $fourStars,
            'stars_3' => $threeStars,
            'stars_2' => $twoStars,
            'stars_1' => $oneStar,
            'responded' => $respondedCount,
            'not_responded' => $notRespondedCount,
        ];

        Response::json([
            'success' => true,
            'data' => $reviews,
            'stats' => $stats,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / max(1, $limit))
            ]
        ]);
    }

    public function reply(int $id): void {
        AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $replyText = trim($input['admin_response'] ?? '');

        if ($replyText === '') {
            Response::error('Reply text cannot be empty', 422);
            return;
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE reviews SET admin_response = ?, admin_response_at = NOW() WHERE id = ?");
        $stmt->execute([$replyText, $id]);

        Response::success(null, 'Response saved successfully');
    }

    public function updateStatus(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor', 'admin']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $input['status'] ?? '';

        if (!in_array($status, ['pending', 'approved', 'rejected'])) {
            Response::error('Invalid review status', 422);
            return;
        }

        $db = Database::getConnection();
        $approvedAt = ($status === 'approved') ? date('Y-m-d H:i:s') : null;

        $db->prepare("UPDATE reviews SET status = ?, approved_at = ? WHERE id = ?")->execute([$status, $approvedAt, $id]);

        Response::success(null, "Review status set to '{$status}'");
    }

    public function toggleFeatured(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor', 'admin']);
        $db = Database::getConnection();
        $db->prepare("UPDATE reviews SET is_featured = NOT is_featured WHERE id = ?")->execute([$id]);
        Response::success(null, 'Featured status toggled');
    }

    public function delete(int $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $db->prepare("DELETE FROM reviews WHERE id = ?")->execute([$id]);
        Response::success(null, 'Review deleted successfully');
    }
}
