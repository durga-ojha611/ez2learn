<?php
$payload = [
    'instructor_id' => 1,
    'package_type' => '10hours',
    'total_hours' => 10,
    'lesson_length_hours' => 2,
    'include_test_package' => true,
    'test_package_price' => 195.00,
    'booked_slots' => [
        ['lessonNum' => 1, 'date' => '2026-11-24', 'time' => '10:00 - 12:00', 'duration' => 2],
        ['lessonNum' => 2, 'date' => '2026-11-26', 'time' => '12:00 - 14:00', 'duration' => 2]
    ],
    'student_name' => 'Emma Clarke',
    'first_name' => 'Emma',
    'last_name' => 'Clarke',
    'student_email' => 'emma.clarke@example.com',
    'student_phone' => '0412 345 678',
    'date_of_birth' => '14/06/2005',
    'licence_type' => 'Learner permit',
    'licence_number' => '98765432',
    'licence_state' => 'NSW',
    'driving_experience' => 'Complete beginner',
    'logbook_hours' => 0,
    'pickup_street' => '45 Church Street',
    'pickup_suburb' => 'Parramatta',
    'pickup_postcode' => '2150',
    'emergency_name' => 'Robert Clarke',
    'emergency_phone' => '0411 987 654',
    'emergency_relation' => 'Parent',
    'special_notes' => 'A bit nervous in city traffic, first time driving in Sydney.',
    'prefer_calm_instructor' => true,
    'payment_method' => 'Credit Card',
    'subtotal' => 750.00,
    'discount_amount' => 75.00,
    'total_amount' => 870.00,
    'promo_code' => 'EZY10'
];

$opts = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($payload)
    ]
];
$ctx = stream_context_create($opts);
$res = file_get_contents('http://127.0.0.1:8000/api/bookings', false, $ctx);
echo $res . "\n";
