<?php
require_once __DIR__ . '/../config/database.php';
$db = Database::getConnection();

echo "=== website_pages records ===\n";
$stmt = $db->query("SELECT id, page_key, title, meta_description, updated_at FROM website_pages");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== faqs count ===\n";
$stmt = $db->query("SELECT count(*) as count FROM faqs");
print_r($stmt->fetch(PDO::FETCH_ASSOC));

echo "\n=== gallery count ===\n";
$stmt = $db->query("SELECT count(*) as count FROM gallery");
print_r($stmt->fetch(PDO::FETCH_ASSOC));
