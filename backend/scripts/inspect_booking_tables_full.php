<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

$tables = ['instructors', 'students', 'bookings', 'payments', 'packages', 'services', 'suburbs', 'instructor_service_areas', 'notifications'];

foreach ($tables as $t) {
    echo "=== Table: {$t} ===\n";
    $stmt = $db->query("DESCRIBE {$t}");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("  %-25s %-20s %-6s\n", $row['Field'], $row['Type'], $row['Null']);
    }
    echo "\n";
}
