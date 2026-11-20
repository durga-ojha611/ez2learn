<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

echo "=== LATEST BOOKING ===\n";
$b = $db->query("SELECT * FROM bookings ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
echo json_encode($b, JSON_PRETTY_PRINT) . "\n\n";

echo "=== LATEST PAYMENT ===\n";
$p = $db->query("SELECT * FROM payments ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
echo json_encode($p, JSON_PRETTY_PRINT) . "\n\n";

echo "=== LATEST NOTIFICATION ===\n";
$n = $db->query("SELECT * FROM notifications ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
echo json_encode($n, JSON_PRETTY_PRINT) . "\n\n";
