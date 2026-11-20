<?php
echo "=== 1. Testing Availability ===\n";
echo file_get_contents('http://127.0.0.1:8000/api/instructors/1/availability?date=2026-11-26') . "\n\n";

echo "=== 2. Testing Suburbs ===\n";
echo substr(file_get_contents('http://127.0.0.1:8000/api/suburbs'), 0, 200) . "...\n\n";

echo "=== 3. Testing Promo Validation ===\n";
$opts = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode(['code' => 'EZY10', 'subtotal' => 675.00])
    ]
];
$ctx = stream_context_create($opts);
echo file_get_contents('http://127.0.0.1:8000/api/promo/validate', false, $ctx) . "\n\n";
