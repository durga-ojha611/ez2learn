<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

$hash = password_hash('password123', PASSWORD_BCRYPT);
$db->prepare("UPDATE admin_users SET password_hash = ?")->execute([$hash]);
echo "Updated all admin users to password123\n";
