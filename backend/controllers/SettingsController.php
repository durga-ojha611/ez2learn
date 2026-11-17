<?php
// backend/controllers/SettingsController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class SettingsController {
    public function getSettings(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $rows = $db->query("SELECT * FROM website_settings")->fetchAll();
        $settings = [];
        foreach ($rows as $r) {
            $settings[$r['setting_key']] = $r['setting_value'];
        }

        Response::success($settings, 'Settings retrieved');
    }

    public function updateSettings(): void {
        AuthMiddleware::checkRole(['super_admin']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            INSERT INTO website_settings (setting_key, setting_value)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        ");

        foreach ($input as $key => $val) {
            $stmt->execute([$key, is_array($val) ? json_encode($val) : (string)$val]);
        }

        Response::success(null, 'Settings saved successfully');
    }

    // Admin Users Management
    public function getUsers(): void {
        AuthMiddleware::checkRole(['super_admin']);
        $db = Database::getConnection();

        $users = $db->query("
            SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.status, u.last_login_at, u.created_at,
                   r.id as role_id, r.name as role_name, r.display_name as role_display_name
            FROM admin_users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.id ASC
        ")->fetchAll();

        $roles = $db->query("SELECT * FROM roles ORDER BY id ASC")->fetchAll();

        $permissions = $db->query("
            SELECT p.*,
                   (
                       SELECT GROUP_CONCAT(rp.role_id) 
                       FROM role_permissions rp 
                       WHERE rp.permission_id = p.id
                   ) as assigned_role_ids
            FROM permissions p
            ORDER BY p.module ASC, p.id ASC
        ")->fetchAll();

        foreach ($permissions as &$p) {
            $p['assigned_role_ids'] = !empty($p['assigned_role_ids']) ? array_map('intval', explode(',', $p['assigned_role_ids'])) : [];
        }

        Response::success([
            'users' => $users,
            'roles' => $roles,
            'permissions' => $permissions
        ], 'Users and roles retrieved');
    }

    public function storeUser(): void {
        AuthMiddleware::checkRole(['super_admin']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator($input);
        if (!$validator->validate([
            'name' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6',
            'role_id' => 'required|numeric'
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();
        $check = $db->prepare("SELECT id FROM admin_users WHERE email = ?");
        $check->execute([$input['email']]);
        if ($check->fetch()) {
            Response::error('User with this email already exists', 409);
        }

        $hash = password_hash($input['password'], PASSWORD_BCRYPT);

        $stmt = $db->prepare("
            INSERT INTO admin_users (role_id, name, email, password_hash, phone, avatar_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            (int)$input['role_id'],
            $input['name'],
            $input['email'],
            $hash,
            $input['phone'] ?? null,
            $input['avatar_url'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            $input['status'] ?? 'active'
        ]);

        Response::success(['id' => $db->lastInsertId()], 'Admin user created', 201);
    }

    public function updateUser(int $id): void {
        AuthMiddleware::checkRole(['super_admin']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE admin_users SET
                name = COALESCE(?, name),
                email = COALESCE(?, email),
                role_id = COALESCE(?, role_id),
                phone = COALESCE(?, phone),
                avatar_url = COALESCE(?, avatar_url),
                status = COALESCE(?, status)
            WHERE id = ?
        ");
        $stmt->execute([
            $input['name'] ?? null,
            $input['email'] ?? null,
            isset($input['role_id']) ? (int)$input['role_id'] : null,
            $input['phone'] ?? null,
            $input['avatar_url'] ?? null,
            $input['status'] ?? null,
            $id
        ]);

        if (!empty($input['password'])) {
            $hash = password_hash($input['password'], PASSWORD_BCRYPT);
            $db->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?")->execute([$hash, $id]);
        }

        Response::success(null, 'Admin user updated');
    }

    public function deleteUser(int $id): void {
        AuthMiddleware::checkRole(['super_admin']);
        $db = Database::getConnection();

        // Prevent deleting own account or the master super admin
        if ($id === 1) {
            Response::error('Master super admin cannot be deleted', 400);
        }

        $db->prepare("DELETE FROM admin_users WHERE id = ?")->execute([$id]);
        Response::success(null, 'User deleted');
    }

    public function updateRolePermissions(): void {
        AuthMiddleware::checkRole(['super_admin']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $roleId = (int)($input['role_id'] ?? 0);
        $permissionIds = $input['permission_ids'] ?? [];

        if (!$roleId) {
            Response::error('Role ID is required', 422);
        }

        $db = Database::getConnection();
        $db->prepare("DELETE FROM role_permissions WHERE role_id = ?")->execute([$roleId]);

        if (!empty($permissionIds) && is_array($permissionIds)) {
            $insert = $db->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
            foreach ($permissionIds as $pId) {
                $insert->execute([$roleId, (int)$pId]);
            }
        }

        Response::success(null, 'Role permissions updated');
    }
}

