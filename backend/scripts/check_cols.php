<?php
require 'backend/config/database.php';
$db = Database::getConnection();
$cols1 = $db->query('DESCRIBE services')->fetchAll(PDO::FETCH_COLUMN);
$cols2 = $db->query('DESCRIBE packages')->fetchAll(PDO::FETCH_COLUMN);
echo 'services cols: ' . implode(', ', $cols1) . "\n";
echo 'packages cols: ' . implode(', ', $cols2) . "\n";
