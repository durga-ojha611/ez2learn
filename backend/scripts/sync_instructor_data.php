<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

// Ensure Sofia Reyes is active
$db->query("UPDATE instructors SET status = 'active' WHERE id = 9");

// Ensure service areas are set
$updates = [
    1 => [
        'suburbs' => 'Parramatta, Blacktown, Westmead, Merrylands, Castle Hill, Ryde, Auburn',
        'rate' => 75.00,
        'car' => 'Toyota Corolla Hybrid (Dual-Control)',
        'hours_start' => '07:00:00',
        'hours_end' => '18:30:00'
    ],
    7 => [ // Priya Nair
        'suburbs' => 'Northside, Chatswood, Ryde, Epping, Macquarie Park',
        'rate' => 70.00,
        'car' => 'Kia Cerato (Dual-Control)',
        'hours_start' => '08:00:00',
        'hours_end' => '18:30:00'
    ],
    6 => [ // Daniel Okafor
        'suburbs' => 'Sydney CBD, Surry Hills, Randwick, Marrickville, Inner West',
        'rate' => 75.00,
        'car' => 'Toyota Corolla (Dual-Control)',
        'hours_start' => '07:30:00',
        'hours_end' => '18:00:00'
    ],
    9 => [ // Sofia Reyes
        'suburbs' => 'Liverpool, Campbelltown, Bankstown, Cabramatta',
        'rate' => 70.00,
        'car' => 'Mazda 2 (Dual-Control)',
        'hours_start' => '08:00:00',
        'hours_end' => '18:00:00'
    ]
];

foreach ($updates as $id => $data) {
    $db->prepare("
        UPDATE instructors 
        SET service_areas = ?, hourly_rate = ?, status = 'active', working_hours_start = ?, working_hours_end = ?
        WHERE id = ?
    ")->execute([$data['suburbs'], $data['rate'], $data['hours_start'], $data['hours_end'], $id]);
}

echo "Instructors updated successfully.\n";
