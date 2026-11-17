<?php
// backend/middleware/AuthMiddleware.php
require_once dirname(__DIR__) . '/helpers/Auth.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/config/database.php';

class AuthMiddleware {
    public static function authenticate(): array {
        $token = Auth::getBearerToken();
        if (!$token) {
            Response::error('Unauthorized. Authentication token is missing.', 401);
        }

        $payload = Auth::verifyToken($token);
        if (!$payload || !isset($payload['user_id'])) {
            Response::error('Unauthorized. Invalid or expired token.', 401);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT u.id, u.name, u.email, u.role_id, u.avatar_url, u.status, r.name as role_name, r.display_name as role_display_name
            FROM admin_users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ? AND u.status = 'active'
            LIMIT 1
        ");
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('Unauthorized. User not found or inactive.', 401);
        }

        return $user;
    }

    public static function checkRole(array $allowedRoles): array {
        $user = self::authenticate();
        if (!in_array($user['role_name'], $allowedRoles) && $user['role_name'] !== 'super_admin') {
            Response::error('Forbidden. Insufficient permissions for this action.', 403);
        }
        return $user;
    }
}

