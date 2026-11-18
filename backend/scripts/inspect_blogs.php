<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();
$cols = $db->query("DESCRIBE blogs")->fetchAll(PDO::FETCH_ASSOC);
print_r($cols);
$rows = $db->query("SELECT id, title, category, publisher_name, status FROM blogs")->fetchAll(PDO::FETCH_ASSOC);
print_r($rows);
