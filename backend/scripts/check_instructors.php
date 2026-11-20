<?php
require_once dirname(__DIR__) . '/config/database.php';

$db = Database::getConnection();
$stmt = $db->query("SELECT id, name, email, phone, transmission, vehicle_make, vehicle_model, service_areas FROM instructors");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Current instructors in DB:\n";
print_r($rows);
