<?php
// backend/controllers/NotificationController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class NotificationController {
    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $category = trim($_GET['category'] ?? '');
        $where = ['1=1'];
        $params = [];

        if ($category !== '' && $category !== 'all') {
            $where[] = 'category = ?';
            $params[] = $category;
        }

        $whereSql = implode(' AND ', $where);

        $stmt = $db->prepare("SELECT * FROM notifications WHERE {$whereSql} ORDER BY id DESC LIMIT 50");
        $stmt->execute($params);
        $notifications = $stmt->fetchAll();

        $unreadCount = (int)$db->query("SELECT COUNT(*) FROM notifications WHERE is_read = 0")->fetchColumn();

        Response::success([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ], 'Notifications retrieved');
    }

    public function markAsRead(int $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?")->execute([$id]);
        Response::success(null, 'Notification marked as read');
    }

    public function markAllAsRead(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $db->query("UPDATE notifications SET is_read = 1 WHERE is_read = 0");
        Response::success(null, 'All notifications marked as read');
    }

    public function delete(int $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $db->prepare("DELETE FROM notifications WHERE id = ?")->execute([$id]);
        Response::success(null, 'Notification dismissed');
    }
}

