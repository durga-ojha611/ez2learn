<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

// 1. Add accessible_sections column if not exists
$cols = $db->query("SHOW COLUMNS FROM admin_users LIKE 'accessible_sections'")->fetchAll();
if (empty($cols)) {
    $db->exec("ALTER TABLE admin_users ADD COLUMN accessible_sections JSON NULL AFTER phone");
    echo "Added accessible_sections column to admin_users table.\n";
} else {
    echo "accessible_sections column already exists.\n";
}

// 2. Add sub_admin role if not exists
$subAdminRole = $db->query("SELECT id FROM roles WHERE name = 'sub_admin'")->fetch();
if (!$subAdminRole) {
    $db->exec("INSERT INTO roles (name, display_name, description) VALUES ('sub_admin', 'Sub-Administrator', 'Custom access permitted by Super Admin')");
    $subAdminRoleId = $db->lastInsertId();
    echo "Created sub_admin role with ID: {$subAdminRoleId}\n";
} else {
    $subAdminRoleId = $subAdminRole['id'];
}

// 3. Update Super Admin (David Miller)
$allSections = json_encode([
    'dashboard', 'bookings', 'inquiries', 'instructors', 'students',
    'calendar', 'services', 'payments', 'locations', 'reviews',
    'blogs', 'website_content', 'notifications', 'settings'
]);

$db->prepare("UPDATE admin_users SET accessible_sections = ? WHERE id = 1")->execute([$allSections]);
echo "Updated Super Admin permissions.\n";

// 4. Update Sarah Jenkins (Bookings & Students Coordinator)
$sarahSections = json_encode(['dashboard', 'bookings', 'inquiries', 'students', 'calendar']);
$db->prepare("UPDATE admin_users SET accessible_sections = ? WHERE id = 2")->execute([$sarahSections]);

// 5. Update Marcus Wong (Instructor Fleet Coordinator)
$marcusSections = json_encode(['dashboard', 'instructors', 'locations', 'calendar']);
$db->prepare("UPDATE admin_users SET accessible_sections = ? WHERE id = 3")->execute([$marcusSections]);

// 6. Update Elena Rostova (Finance & Payments)
$elenaSections = json_encode(['dashboard', 'payments', 'reviews']);
$db->prepare("UPDATE admin_users SET accessible_sections = ? WHERE id = 4")->execute([$elenaSections]);

// 7. Verify all users
$users = $db->query("SELECT id, name, email, accessible_sections FROM admin_users")->fetchAll(PDO::FETCH_ASSOC);
print_r($users);
