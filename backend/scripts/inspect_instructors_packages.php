<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

echo "--- INSTRUCTORS ---\n";
$insts = $db->query('SELECT id, name, hourly_rate, transmission, vehicle_make, vehicle_model, rating, total_reviews, status FROM instructors')->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($insts, JSON_PRETTY_PRINT) . "\n";

echo "--- PACKAGES ---\n";
$pkgs = $db->query('SELECT id, name, lesson_count, duration_per_lesson, price_aud, discount_amount, is_active FROM packages')->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($pkgs, JSON_PRETTY_PRINT) . "\n";

echo "--- SUBURBS ---\n";
$subs = $db->query('SELECT id, name, postcode, region FROM suburbs LIMIT 15')->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($subs, JSON_PRETTY_PRINT) . "\n";
