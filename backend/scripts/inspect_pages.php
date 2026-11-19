<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

$rows = $db->query("SELECT id, page_key, title, meta_description FROM website_pages")->fetchAll(PDO::FETCH_ASSOC);
print_r($rows);
