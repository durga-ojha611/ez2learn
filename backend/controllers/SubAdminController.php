<?php
// backend/controllers/SubAdminController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class SubAdminController {
    // List of all sidebar modules available for permission assignment
    public static array $AVAILABLE_SECTIONS = [
        [
            'key' => 'dashboard',
            'name' => 'Dashboard Overview',
            'icon' => 'LayoutDashboard',
            'description' => 'Real-time KPIs, revenue stats, today schedule & system alerts',
            'group' => 'OVERVIEW'
        ],
        [
            'key' => 'bookings',
            'name' => 'Bookings Management',
            'icon' => 'CalendarCheck2',
            'description' => 'Create, reschedule, cancel lessons, and assign instructors',
            'group' => 'MANAGEMENT'
        ],
        [
            'key' => 'inquiries',
            'name' => 'Inquiries & Student Leads',
            'icon' => 'Inbox',
            'description' => 'Manage incoming student quotes, leads, and booking conversions',
            'group' => 'MANAGEMENT'
        ],
        [
            'key' => 'instructors',
            'name' => 'Instructors Directory',
            'icon' => 'UserCheck',
            'description' => 'Instructor profiles, dual-control cars, working hours & RMS licences',
            'group' => 'MANAGEMENT'
        ],
        [
            'key' => 'students',
            'name' => 'Customers / Students Directory',
            'icon' => 'GraduationCap',
            'description' => 'Learner profiles, lesson balance records, logbooks & emergency contacts',
            'group' => 'MANAGEMENT'
        ],
        [
            'key' => 'calendar',
            'name' => 'Schedule & Calendar',
            'icon' => 'CalendarClock',
            'description' => 'Weekly and monthly timetable slots, driving tests & car availability',
            'group' => 'MANAGEMENT'
        ],
        [
            'key' => 'services',
            'name' => 'Services & Packages',
            'icon' => 'Layers',
            'description' => 'Lesson pricing, beginner multi-packs & RMS test packages',
            'group' => 'BUSINESS'
        ],
        [
            'key' => 'payments',
            'name' => 'Payments & Invoices',
            'icon' => 'CreditCard',
            'description' => 'Australian Tax Invoices, Stripe transactions & bank remittances',
            'group' => 'BUSINESS'
        ],
        [
            'key' => 'locations',
            'name' => 'Locations & Suburbs',
            'icon' => 'MapPin',
            'description' => 'Operating service regions, pickup postcodes & RMS test centers',
            'group' => 'BUSINESS'
        ],
        [
            'key' => 'reviews',
            'name' => 'Reviews & Ratings',
            'icon' => 'Star',
            'description' => 'Student testimonials, star ratings & public approval moderation',
            'group' => 'BUSINESS'
        ],
        [
            'key' => 'blogs',
            'name' => 'Blog Management',
            'icon' => 'Newspaper',
            'description' => 'Publish and edit student driving guides, RMS road rules & articles',
            'group' => 'WEBSITE MANAGEMENT'
        ],
        [
            'key' => 'website_content',
            'name' => 'Website Content & CMS',
            'icon' => 'Globe',
            'description' => 'Edit marketing pages, FAQs, student pass gallery & school policies',
            'group' => 'WEBSITE MANAGEMENT'
        ],
        [
            'key' => 'notifications',
            'name' => 'System Notifications',
            'icon' => 'Bell',
            'description' => 'Operational system alerts, booking changes and instructor licence renewals',
            'group' => 'SYSTEM'
        ],
        [
            'key' => 'settings',
            'name' => 'Settings & Business Profile',
            'icon' => 'Settings',
            'description' => 'Australian school details, ABN, banking PayID, SMTP emails & Sub-Admin management',
            'group' => 'SYSTEM'
        ]
    ];

    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT u.id, u.role_id, u.name, u.email, u.phone, u.status, u.accessible_sections, u.last_login_at, u.created_at,
                   r.name as role_name, r.display_name as role_display_name
            FROM admin_users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.id ASC
        ");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted = array_map(function($u) {
            $sections = json_decode($u['accessible_sections'] ?? '[]', true);
            if ($u['role_name'] === 'super_admin' || empty($sections)) {
                $u['accessible_sections'] = array_column(self::$AVAILABLE_SECTIONS, 'key');
            } else {
                $u['accessible_sections'] = $sections;
            }
            return $u;
        }, $users);

        $stats = [
            'total' => count($formatted),
            'super_admin' => count(array_filter($formatted, fn($u) => $u['role_name'] === 'super_admin')),
            'sub_admins' => count(array_filter($formatted, fn($u) => $u['role_name'] !== 'super_admin')),
            'active' => count(array_filter($formatted, fn($u) => $u['status'] === 'active')),
            'suspended' => count(array_filter($formatted, fn($u) => $u['status'] === 'suspended' || $u['status'] === 'inactive')),
        ];

        Response::success([
            'subadmins' => $formatted,
            'stats' => $stats,
            'available_sections' => self::$AVAILABLE_SECTIONS
        ], 'Sub-admins retrieved successfully');
    }

    public function store(): void {
        $currentUser = AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator($input);
        if (!$validator->validate([
            'name' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6',
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();

        // Check if email already exists
        $chk = $db->prepare("SELECT id FROM admin_users WHERE email = ?");
        $chk->execute([$input['email']]);
        if ($chk->fetch()) {
            Response::error('An administrator account with this email address already exists.', 409);
        }

        // Get sub_admin role id
        $roleStmt = $db->query("SELECT id FROM roles WHERE name = 'sub_admin' LIMIT 1");
        $role = $roleStmt->fetch(PDO::FETCH_ASSOC);
        $roleId = $role ? (int)$role['id'] : 2;

        $accessibleSections = is_array($input['accessible_sections'] ?? null)
            ? array_values(array_filter($input['accessible_sections']))
            : ['dashboard'];

        if (empty($accessibleSections)) {
            $accessibleSections = ['dashboard'];
        }

        $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);
        $status = in_array($input['status'] ?? '', ['active', 'suspended', 'inactive']) ? $input['status'] : 'active';
        $phone = $input['phone'] ?? null;

        $stmt = $db->prepare("
            INSERT INTO admin_users (role_id, name, email, password_hash, phone, status, accessible_sections)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $roleId,
            $input['name'],
            $input['email'],
            $passwordHash,
            $phone,
            $status,
            json_encode($accessibleSections)
        ]);

        $newId = (int)$db->lastInsertId();

        // Log action in activity_logs
        try {
            $db->prepare("
                INSERT INTO activity_logs (admin_user_id, action, entity_type, entity_id, details)
                VALUES (?, 'create_subadmin', 'admin_users', ?, ?)
            ")->execute([
                $currentUser['id'],
                $newId,
                json_encode(['email' => $input['email'], 'accessible_sections' => $accessibleSections])
            ]);
        } catch (\Exception $e) {}

        Response::success([
            'id' => $newId,
            'name' => $input['name'],
            'email' => $input['email'],
            'status' => $status,
            'accessible_sections' => $accessibleSections
        ], 'Sub-Admin account created successfully', 201);
    }

    public function update(int $id): void {
        $currentUser = AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM admin_users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            Response::error('Sub-Admin user not found', 404);
        }

        // Prevent disabling Super Admin
        if ($id === 1 && isset($input['status']) && $input['status'] !== 'active') {
            Response::error('Primary Super Administrator cannot be suspended.', 403);
        }

        $name = !empty($input['name']) ? $input['name'] : $user['name'];
        $email = !empty($input['email']) ? $input['email'] : $user['email'];
        $status = in_array($input['status'] ?? '', ['active', 'suspended', 'inactive']) ? $input['status'] : $user['status'];
        $phone = $input['phone'] ?? $user['phone'];

        // Sections
        if (isset($input['accessible_sections']) && is_array($input['accessible_sections'])) {
            $sections = array_values(array_filter($input['accessible_sections']));
            if (empty($sections)) {
                $sections = ['dashboard'];
            }
            $sectionsJson = json_encode($sections);
        } else {
            $sectionsJson = $user['accessible_sections'];
        }

        // Password update if provided
        if (!empty($input['password'])) {
            if (strlen($input['password']) < 6) {
                Response::error('Password must be at least 6 characters long.', 422);
            }
            $newHash = password_hash($input['password'], PASSWORD_BCRYPT);
            $updStmt = $db->prepare("
                UPDATE admin_users
                SET name = ?, email = ?, phone = ?, status = ?, accessible_sections = ?, password_hash = ?
                WHERE id = ?
            ");
            $updStmt->execute([$name, $email, $phone, $status, $sectionsJson, $newHash, $id]);
        } else {
            $updStmt = $db->prepare("
                UPDATE admin_users
                SET name = ?, email = ?, phone = ?, status = ?, accessible_sections = ?
                WHERE id = ?
            ");
            $updStmt->execute([$name, $email, $phone, $status, $sectionsJson, $id]);
        }

        // Log action
        try {
            $db->prepare("
                INSERT INTO activity_logs (admin_user_id, action, entity_type, entity_id, details)
                VALUES (?, 'update_subadmin', 'admin_users', ?, ?)
            ")->execute([
                $currentUser['id'],
                $id,
                json_encode(['email' => $email, 'status' => $status])
            ]);
        } catch (\Exception $e) {}

        Response::success([
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'status' => $status,
            'accessible_sections' => json_decode($sectionsJson, true)
        ], 'Sub-Admin updated successfully');
    }

    public function delete(int $id): void {
        $currentUser = AuthMiddleware::authenticate();
        if ($id === 1) {
            Response::error('Primary Super Administrator cannot be deleted.', 403);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT email FROM admin_users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('User not found', 404);
        }

        $db->prepare("DELETE FROM admin_users WHERE id = ?")->execute([$id]);

        try {
            $db->prepare("
                INSERT INTO activity_logs (admin_user_id, action, entity_type, entity_id, details)
                VALUES (?, 'delete_subadmin', 'admin_users', ?, ?)
            ")->execute([
                $currentUser['id'],
                $id,
                json_encode(['email' => $user['email']])
            ]);
        } catch (\Exception $e) {}

        Response::success(null, 'Sub-Admin account deleted successfully');
    }

    public function activity(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        // Get login activity from activity_logs or last_login_at
        $stmt = $db->query("
            SELECT u.id as user_id, u.name, u.email, u.status, u.last_login_at, u.accessible_sections,
                   r.display_name as role_name
            FROM admin_users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.last_login_at IS NOT NULL
            ORDER BY u.last_login_at DESC
            LIMIT 10
        ");
        $logins = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted = array_map(function($l) {
            $l['accessible_sections'] = json_decode($l['accessible_sections'] ?? '[]', true);
            return $l;
        }, $logins);

        Response::success($formatted, 'Login activity retrieved');
    }
}
