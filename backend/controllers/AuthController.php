<?php
// backend/controllers/AuthController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Auth.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class AuthController {
    public function login(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $validator = new Validator($input);
        if (!$validator->validate([
            'email' => 'required|email',
            'password' => 'required|min:6'
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT u.*, r.name as role_name, r.display_name as role_display_name
            FROM admin_users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = ?
            LIMIT 1
        ");
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            Response::error('Invalid email or password', 401);
        }

        if ($user['status'] !== 'active') {
            Response::error('Your account has been deactivated. Please contact Super Admin.', 403);
        }

        // Fetch permissions
        $permStmt = $db->prepare("
            SELECT p.code FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
        ");
        $permStmt->execute([$user['role_id']]);
        $permissions = $permStmt->fetchAll(PDO::FETCH_COLUMN);

        // Update last login
        $db->prepare("UPDATE admin_users SET last_login_at = NOW() WHERE id = ?")->execute([$user['id']]);

        // Generate JWT
        $token = Auth::generateToken([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role_name']
        ]);

        unset($user['password_hash']);
        $user['permissions'] = $permissions;

        Response::success([
            'token' => $token,
            'user' => $user
        ], 'Login successful');
    }

    public function me(): void {
        $user = AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $permStmt = $db->prepare("
            SELECT p.code FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
        ");
        $permStmt->execute([$user['role_id']]);
        $user['permissions'] = $permStmt->fetchAll(PDO::FETCH_COLUMN);

        Response::success($user, 'Authenticated user details');
    }

    public function logout(): void {
        Response::success(null, 'Successfully logged out');
    }

    public function updatePassword(): void {
        $user = AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator($input);
        if (!$validator->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6'
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT password_hash FROM admin_users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $currentHash = $stmt->fetchColumn();

        if (!password_verify($input['current_password'], $currentHash)) {
            Response::error('Current password does not match.', 400);
        }

        $newHash = password_hash($input['new_password'], PASSWORD_BCRYPT);
        $db->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?")->execute([$newHash, $user['id']]);

        Response::success(null, 'Password updated successfully');
    }
}

