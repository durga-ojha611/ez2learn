<?php
require_once __DIR__ . '/../config/database.php';
$pdo = Database::getConnection();

// Fix payment_status and paid_at
$pdo->exec("UPDATE payments SET payment_status = 'paid', paid_at = COALESCE(paid_at, created_at, NOW()) WHERE payment_status = '' OR payment_status IS NULL");

$rev = $pdo->query("SELECT SUM(amount_aud) FROM payments WHERE payment_status = 'paid'")->fetchColumn();
echo "Total Payments Revenue: $" . $rev . "\n";

$bRev = $pdo->query("SELECT SUM(amount_aud) FROM bookings WHERE payment_status = 'paid'")->fetchColumn();
echo "Total Bookings Revenue: $" . $bRev . "\n";
