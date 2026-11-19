<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

echo "=== faqs ===\n";
print_r($db->query("SELECT * FROM faqs LIMIT 3")->fetchAll(PDO::FETCH_ASSOC));

echo "=== gallery ===\n";
print_r($db->query("SELECT * FROM gallery LIMIT 3")->fetchAll(PDO::FETCH_ASSOC));
