<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

echo "=== admin_users Columns ===\n";
$cols = $db->query("DESCRIBE admin_users")->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $col) {
    echo $col['Field'] . " (" . $col['Type'] . ")\n";
}

echo "\n=== admin_users Records ===\n";
$users = $db->query("SELECT id, role_id, name, email, status, last_login_at FROM admin_users")->fetchAll(PDO::FETCH_ASSOC);
print_r($users);

echo "\n=== roles Records ===\n";
$roles = $db->query("SELECT * FROM roles")->fetchAll(PDO::FETCH_ASSOC);
print_r($roles);
