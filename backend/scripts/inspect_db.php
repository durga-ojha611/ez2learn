<?php
require_once __DIR__ . '/../config/database.php';
$pdo = Database::getConnection();
echo "--- DESCRIBE NOTIFICATIONS ---\n";
print_r($pdo->query("DESCRIBE notifications")->fetchAll());
