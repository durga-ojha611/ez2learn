<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();
$db->exec("UPDATE services SET is_active = 1 WHERE id = 1");
$stmt = $db->query("SELECT id, name, category, is_active FROM services");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
