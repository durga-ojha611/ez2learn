<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

$tables = $db->query("SHOW TABLES LIKE '%content%'")->fetchAll(PDO::FETCH_COLUMN);
$tables2 = $db->query("SHOW TABLES LIKE '%page%'")->fetchAll(PDO::FETCH_COLUMN);
$tables3 = $db->query("SHOW TABLES LIKE '%faq%'")->fetchAll(PDO::FETCH_COLUMN);
$tables4 = $db->query("SHOW TABLES LIKE '%gallery%'")->fetchAll(PDO::FETCH_COLUMN);
print_r(array_merge($tables, $tables2, $tables3, $tables4));
