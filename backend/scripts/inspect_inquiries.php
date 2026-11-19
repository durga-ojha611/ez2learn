<?php
require_once __DIR__ . '/../config/database.php';
$db = Database::getConnection();

echo "=== inquiries columns ===\n";
$stmt = $db->query("DESCRIBE inquiries");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== sample inquiries ===\n";
$stmt = $db->query("SELECT * FROM inquiries LIMIT 10");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
