<?php
// backend/scripts/seed_reference_records.php
require_once __DIR__ . '/../config/database.php';
$db = Database::getConnection();

echo "Seeding reference records into MySQL ezy2learn_db...\n";

// 1. Instructors
$instructors = [
    [
        'code' => 'INS-2587',
        'name' => 'Rohan Mehta',
        'email' => 'rohan.mehta@ezy2learn.com.au',
        'phone' => '+91 91234 56789',
        'transmission' => 'manual',
        'vehicle_make' => 'Toyota',
        'vehicle_model' => 'Corolla',
        'vehicle_year' => 2023,
        'vehicle_rego' => 'NSW-ROH782',
        'rating' => 4.95,
        'total_reviews' => 164,
        'status' => 'active',
        'accreditation_number' => 'RMS-INST-2587',
        'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'INS-2586',
        'name' => 'Sneha Patel',
        'email' => 'sneha.patel@ezy2learn.com.au',
        'phone' => '+91 92345 67890',
        'transmission' => 'automatic',
        'vehicle_make' => 'Hyundai',
        'vehicle_model' => 'i30',
        'vehicle_year' => 2024,
        'vehicle_rego' => 'NSW-SNE482',
        'rating' => 4.92,
        'total_reviews' => 138,
        'status' => 'active',
        'accreditation_number' => 'RMS-INST-2586',
        'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'INS-2585',
        'name' => 'Karan Singh',
        'email' => 'karan.singh@ezy2learn.com.au',
        'phone' => '+91 94567 89012',
        'transmission' => 'manual',
        'vehicle_make' => 'Kia',
        'vehicle_model' => 'Cerato GT',
        'vehicle_year' => 2023,
        'vehicle_rego' => 'NSW-KAR991',
        'rating' => 4.88,
        'total_reviews' => 112,
        'status' => 'active',
        'accreditation_number' => 'RMS-INST-2585',
        'avatar_url' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'INS-2588',
        'name' => 'Aman Verma',
        'email' => 'aman.verma.ins@ezy2learn.com.au',
        'phone' => '+91 93456 78901',
        'transmission' => 'manual',
        'vehicle_make' => 'Mazda',
        'vehicle_model' => 'Mazda 3',
        'vehicle_year' => 2023,
        'vehicle_rego' => 'NSW-AMN319',
        'rating' => 4.85,
        'total_reviews' => 89,
        'status' => 'active',
        'accreditation_number' => 'RMS-INST-2588',
        'avatar_url' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    ],
];

foreach ($instructors as $inst) {
    $existing = $db->prepare("SELECT id FROM instructors WHERE email = ? OR instructor_code = ?");
    $existing->execute([$inst['email'], $inst['code']]);
    $id = $existing->fetchColumn();

    if ($id) {
        $db->prepare("UPDATE instructors SET instructor_code=?, name=?, phone=?, transmission=?, vehicle_make=?, vehicle_model=?, vehicle_year=?, vehicle_rego=?, rating=?, total_reviews=?, status=?, accreditation_number=?, avatar_url=? WHERE id=?")
            ->execute([$inst['code'], $inst['name'], $inst['phone'], $inst['transmission'], $inst['vehicle_make'], $inst['vehicle_model'], $inst['vehicle_year'], $inst['vehicle_rego'], $inst['rating'], $inst['total_reviews'], $inst['status'], $inst['accreditation_number'], $inst['avatar_url'], $id]);
        echo " - Updated instructor {$inst['name']}\n";
    } else {
        $db->prepare("INSERT INTO instructors (instructor_code, name, email, phone, transmission, vehicle_make, vehicle_model, vehicle_year, vehicle_rego, rating, total_reviews, status, accreditation_number, avatar_url, hourly_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 85.00)")
            ->execute([$inst['code'], $inst['name'], $inst['email'], $inst['phone'], $inst['transmission'], $inst['vehicle_make'], $inst['vehicle_model'], $inst['vehicle_year'], $inst['vehicle_rego'], $inst['rating'], $inst['total_reviews'], $inst['status'], $inst['accreditation_number'], $inst['avatar_url']]);
        echo " - Inserted instructor {$inst['name']}\n";
    }
}

// 2. Students
$students = [
    [
        'code' => 'STU-1045',
        'name' => 'Priya Sharma',
        'first_name' => 'Priya',
        'last_name' => 'Sharma',
        'email' => 'priya@gmail.com',
        'phone' => '+91 98765 43210',
        'suburb' => 'Sydney',
        'licence_stage' => 'learner',
        'licence_status' => 'Valid',
        'licence_number' => 'NSW-L981245',
        'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'completed_lessons' => 8,
        'remaining_lessons' => 2,
        'nsw_logbook_hours' => 28.0,
        'total_spent' => 600.00,
    ],
    [
        'code' => 'STU-1046',
        'name' => 'Sneha Patel',
        'first_name' => 'Sneha',
        'last_name' => 'Patel',
        'email' => 'sneha@gmail.com',
        'phone' => '+91 87654 32109',
        'suburb' => 'Sydney',
        'licence_stage' => 'learner',
        'licence_status' => 'Valid',
        'licence_number' => 'NSW-L882190',
        'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        'completed_lessons' => 4,
        'remaining_lessons' => 6,
        'nsw_logbook_hours' => 16.0,
        'total_spent' => 250.00,
    ],
    [
        'code' => 'STU-1047',
        'name' => 'Aman Verma',
        'first_name' => 'Aman',
        'last_name' => 'Verma',
        'email' => 'aman.stu@gmail.com',
        'phone' => '+91 93456 78901',
        'suburb' => 'Parramatta',
        'licence_stage' => 'learner',
        'licence_status' => 'Valid',
        'licence_number' => 'NSW-L771239',
        'avatar_url' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        'completed_lessons' => 6,
        'remaining_lessons' => 4,
        'nsw_logbook_hours' => 22.0,
        'total_spent' => 450.00,
    ],
    [
        'code' => 'STU-1048',
        'name' => 'Neha Kapoor',
        'first_name' => 'Neha',
        'last_name' => 'Kapoor',
        'email' => 'neha.kapoor@gmail.com',
        'phone' => '+91 97890 12345',
        'suburb' => 'Surry Hills',
        'licence_stage' => 'learner',
        'licence_status' => 'Valid',
        'licence_number' => 'NSW-L661928',
        'avatar_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        'completed_lessons' => 9,
        'remaining_lessons' => 1,
        'nsw_logbook_hours' => 38.0,
        'total_spent' => 720.00,
    ],
    [
        'code' => 'STU-1049',
        'name' => 'Karan Singh',
        'first_name' => 'Karan',
        'last_name' => 'Singh',
        'email' => 'karan.stu@gmail.com',
        'phone' => '+91 95678 90123',
        'suburb' => 'Bondi',
        'licence_stage' => 'provisional_p1',
        'licence_status' => 'Valid',
        'licence_number' => 'NSW-P551029',
        'avatar_url' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        'completed_lessons' => 10,
        'remaining_lessons' => 0,
        'nsw_logbook_hours' => 50.0,
        'total_spent' => 850.00,
    ],
];

foreach ($students as $stu) {
    $existing = $db->prepare("SELECT id FROM students WHERE email = ? OR student_code = ?");
    $existing->execute([$stu['email'], $stu['code']]);
    $id = $existing->fetchColumn();

    if ($id) {
        $db->prepare("UPDATE students SET student_code=?, name=?, first_name=?, last_name=?, phone=?, suburb=?, licence_stage=?, licence_status=?, licence_number=?, avatar_url=?, completed_lessons=?, remaining_lessons=?, nsw_logbook_hours=?, total_spent=? WHERE id=?")
            ->execute([$stu['code'], $stu['name'], $stu['first_name'], $stu['last_name'], $stu['phone'], $stu['suburb'], $stu['licence_stage'], $stu['licence_status'], $stu['licence_number'], $stu['avatar_url'], $stu['completed_lessons'], $stu['remaining_lessons'], $stu['nsw_logbook_hours'], $stu['total_spent'], $id]);
        echo " - Updated student {$stu['name']}\n";
    } else {
        $db->prepare("INSERT INTO students (student_code, name, first_name, last_name, email, phone, suburb, postcode, licence_stage, licence_status, licence_number, avatar_url, completed_lessons, remaining_lessons, nsw_logbook_hours, total_spent, status) VALUES (?, ?, ?, ?, ?, ?, ?, '2000', ?, ?, ?, ?, ?, ?, ?, ?, 'active')")
            ->execute([$stu['code'], $stu['name'], $stu['first_name'], $stu['last_name'], $stu['email'], $stu['phone'], $stu['suburb'], $stu['licence_stage'], $stu['licence_status'], $stu['licence_number'], $stu['avatar_url'], $stu['completed_lessons'], $stu['remaining_lessons'], $stu['nsw_logbook_hours'], $stu['total_spent']]);
        echo " - Inserted student {$stu['name']}\n";
    }
}

// 3. Reference Bookings from user image
$bookings = [
    [
        'code' => 'BK-7824',
        'student_email' => 'priya@gmail.com',
        'instructor_email' => 'rohan.mehta@ezy2learn.com.au',
        'transmission' => 'manual',
        'lesson_date' => '2025-09-15',
        'start_time' => '10:00:00',
        'end_time' => '11:00:00',
        'duration_minutes' => 60,
        'lesson_package' => '5 Lesson Pack',
        'lesson_category' => 'Beginner',
        'number_of_lessons' => 1,
        'amount_aud' => 120.00,
        'discount_aud' => 0.00,
        'final_amount_aud' => 120.00,
        'booking_status' => 'confirmed',
        'payment_status' => 'paid',
        'payment_method' => 'Card',
        'transaction_id' => 'TXN-7824',
        'student_notes' => 'Please be on time.',
        'special_requirements' => 'N/A',
        'admin_notes' => 'Great student!',
        'rescheduling_history' => '1 time',
        'pickup_address' => '123 Main St',
        'pickup_suburb' => 'Sydney',
        'dropoff_address' => '456 George St, Sydney',
    ],
    [
        'code' => 'BK-7823',
        'student_email' => 'aman.stu@gmail.com',
        'instructor_email' => 'sneha.patel@ezy2learn.com.au',
        'transmission' => 'automatic',
        'lesson_date' => '2025-09-15',
        'start_time' => '14:00:00',
        'end_time' => '15:00:00',
        'duration_minutes' => 60,
        'lesson_package' => '10 Lesson Pack',
        'lesson_category' => 'Intermediate',
        'number_of_lessons' => 1,
        'amount_aud' => 120.00,
        'discount_aud' => 0.00,
        'final_amount_aud' => 120.00,
        'booking_status' => 'pending',
        'payment_status' => 'pending',
        'payment_method' => 'Online',
        'transaction_id' => 'TXN-7823',
        'student_notes' => 'First lesson with Sneha.',
        'special_requirements' => 'N/A',
        'admin_notes' => 'Payment link sent.',
        'rescheduling_history' => '0 times',
        'pickup_address' => '45 Church St',
        'pickup_suburb' => 'Parramatta',
        'dropoff_address' => 'Westfield Parramatta',
    ],
    [
        'code' => 'BK-7822',
        'student_email' => 'neha.kapoor@gmail.com',
        'instructor_email' => 'karan.singh@ezy2learn.com.au',
        'transmission' => 'manual',
        'lesson_date' => '2025-09-14',
        'start_time' => '16:00:00',
        'end_time' => '17:00:00',
        'duration_minutes' => 60,
        'lesson_package' => 'Single Standard Lesson',
        'lesson_category' => 'Advanced Maneuvers',
        'number_of_lessons' => 1,
        'amount_aud' => 120.00,
        'discount_aud' => 0.00,
        'final_amount_aud' => 120.00,
        'booking_status' => 'completed',
        'payment_status' => 'paid',
        'payment_method' => 'Card',
        'transaction_id' => 'TXN-7822',
        'student_notes' => 'Parallel parking focus.',
        'special_requirements' => 'N/A',
        'admin_notes' => 'Successfully completed.',
        'rescheduling_history' => '0 times',
        'pickup_address' => '88 Crown St',
        'pickup_suburb' => 'Surry Hills',
        'dropoff_address' => 'Central Station',
    ],
    [
        'code' => 'BK-1007',
        'student_email' => 'sneha@gmail.com',
        'instructor_email' => 'rohan.mehta@ezy2learn.com.au',
        'transmission' => 'manual',
        'lesson_date' => '2026-11-07',
        'start_time' => '14:00:00',
        'end_time' => '15:00:00',
        'duration_minutes' => 60,
        'lesson_package' => '5 Lesson Package',
        'lesson_category' => 'Standard Driving',
        'number_of_lessons' => 1,
        'amount_aud' => 250.00,
        'discount_aud' => 0.00,
        'final_amount_aud' => 250.00,
        'booking_status' => 'confirmed',
        'payment_status' => 'paid',
        'payment_method' => 'Card',
        'transaction_id' => 'TXN-78452',
        'student_notes' => 'Please be on time.',
        'special_requirements' => 'None',
        'admin_notes' => 'Scheduled for active day 7 Nov.',
        'rescheduling_history' => '0 times',
        'pickup_address' => '123 Main St',
        'pickup_suburb' => 'Sydney',
        'dropoff_address' => '456 George St, Sydney',
    ],
];

foreach ($bookings as $b) {
    $sId = $db->prepare("SELECT id FROM students WHERE email = ?");
    $sId->execute([$b['student_email']]);
    $studentId = $sId->fetchColumn();

    $iId = $db->prepare("SELECT id FROM instructors WHERE email = ? OR name LIKE ?");
    $namePrefix = str_replace(['.ins', '.patel', '.mehta', '.singh', '@ezy2learn.com.au'], '', $b['instructor_email']);
    $iId->execute([$b['instructor_email'], "%{$namePrefix}%"]);
    $instructorId = $iId->fetchColumn();

    if (!$instructorId) $instructorId = 11; // Fallback to Rohan Mehta (ID 11)
    if (!$studentId) $studentId = 1;

    $existing = $db->prepare("SELECT id FROM bookings WHERE booking_code = ?");
    $existing->execute([$b['code']]);
    $bId = $existing->fetchColumn();

    if ($bId) {
        $db->prepare("UPDATE bookings SET student_id=?, instructor_id=?, transmission=?, lesson_date=?, start_time=?, end_time=?, duration_minutes=?, lesson_package=?, lesson_category=?, number_of_lessons=?, amount_aud=?, discount_aud=?, final_amount_aud=?, booking_status=?, payment_status=?, payment_method=?, transaction_id=?, student_notes=?, special_requirements=?, admin_notes=?, rescheduling_history=?, pickup_address=?, pickup_suburb=?, pickup_postcode='2000', dropoff_address=? WHERE id=?")
            ->execute([$studentId, $instructorId, $b['transmission'], $b['lesson_date'], $b['start_time'], $b['end_time'], $b['duration_minutes'], $b['lesson_package'], $b['lesson_category'], $b['number_of_lessons'], $b['amount_aud'], $b['discount_aud'], $b['final_amount_aud'], $b['booking_status'], $b['payment_status'], $b['payment_method'], $b['transaction_id'], $b['student_notes'], $b['special_requirements'], $b['admin_notes'], $b['rescheduling_history'], $b['pickup_address'], $b['pickup_suburb'], $b['dropoff_address'], $bId]);
        echo " - Updated booking {$b['code']}\n";
    } else {
        $db->prepare("INSERT INTO bookings (booking_code, student_id, instructor_id, transmission, lesson_date, start_time, end_time, duration_minutes, lesson_package, lesson_category, number_of_lessons, amount_aud, discount_aud, final_amount_aud, booking_status, payment_status, payment_method, transaction_id, student_notes, special_requirements, admin_notes, rescheduling_history, pickup_address, pickup_suburb, pickup_postcode, dropoff_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '2000', ?)")
            ->execute([$b['code'], $studentId, $instructorId, $b['transmission'], $b['lesson_date'], $b['start_time'], $b['end_time'], $b['duration_minutes'], $b['lesson_package'], $b['lesson_category'], $b['number_of_lessons'], $b['amount_aud'], $b['discount_aud'], $b['final_amount_aud'], $b['booking_status'], $b['payment_status'], $b['payment_method'], $b['transaction_id'], $b['student_notes'], $b['special_requirements'], $b['admin_notes'], $b['rescheduling_history'], $b['pickup_address'], $b['pickup_suburb'], $b['dropoff_address']]);
        echo " - Inserted booking {$b['code']}\n";
    }
}

echo "Seeding completed successfully!\n";
