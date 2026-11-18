<?php
require_once __DIR__ . '/../config/database.php';
$pdo = Database::getConnection();
$stmt = $pdo->query("SHOW TABLES");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $t) {
    $c = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
    printf("%-30s %d\n", $t, $c);
}
