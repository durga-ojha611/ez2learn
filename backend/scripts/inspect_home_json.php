<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

$row = $db->query("SELECT sections_json FROM website_pages WHERE page_key = 'homepage'")->fetch(PDO::FETCH_ASSOC);
echo "Homepage sections_json:\n";
print_r(json_decode($row['sections_json'], true));
