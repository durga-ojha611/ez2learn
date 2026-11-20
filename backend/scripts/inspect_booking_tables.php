<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

$tables = ['students', 'bookings', 'payments', 'instructors', 'packages', 'services', 'notifications'];

foreach ($tables as $t) {
    echo "=== Table: {$t} ===\n";
    try {
        $stmt = $db->query("DESCRIBE {$t}");
        $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cols as $c) {
            echo "  {$c['Field']} ({$c['Type']}) " . ($c['Null'] === 'NO' ? 'NOT NULL' : 'NULL') . "\n";
        }
    } catch (Exception $e) {
        echo "  Error: " . $e->getMessage() . "\n";
    }
    echo "\n";
}
