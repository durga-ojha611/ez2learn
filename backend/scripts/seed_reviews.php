<?php
// backend/scripts/seed_reviews.php
require_once __DIR__ . '/../config/database.php';
$db = Database::getConnection();

// Seed reviews matching user mockup
$reviewsData = [
    [
        'student_name' => 'Priya Sharma',
        'student_id_str' => 'STU-1045',
        'student_email' => 'priya@gmail.com',
        'student_phone' => '+91 98765 43210',
        'student_avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        'instructor_name' => 'Rahul Sinha',
        'instructor_id_str' => 'INS-2587',
        'instructor_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        'booking_ref' => 'INS-2587',
        'booking_code' => 'BK-7892',
        'rating' => 5,
        'review_text' => 'Excellent experience! The instructor was very patient and helped me improve my driving skills. Highly recommended!',
        'date_str' => '12 Sep 2025',
        'submitted_at' => '2025-09-12 10:30:00',
        'lesson_type' => 'Manual',
        'admin_response' => 'Thank you for your kind words! - EZY 2 LEARN Team',
        'admin_response_at' => '2025-09-13 11:20:00',
        'status' => 'approved',
    ],
    [
        'student_name' => 'Rohan Mehta',
        'student_id_str' => 'STU-1046',
        'student_email' => 'rohan@gmail.com',
        'student_phone' => '+91 98765 43211',
        'student_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        'instructor_name' => 'Priya Nair',
        'instructor_id_str' => 'INS-2586',
        'instructor_avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        'booking_ref' => 'INS-2586',
        'booking_code' => 'BK-7891',
        'rating' => 4,
        'review_text' => 'Very helpful instructor. Helped me understand reverse parallel parking with simple reference points.',
        'date_str' => '11 Sep 2025',
        'submitted_at' => '2025-09-11 14:15:00',
        'lesson_type' => 'Automatic',
        'admin_response' => null,
        'admin_response_at' => null,
        'status' => 'approved',
    ],
    [
        'student_name' => 'Sneha Patel',
        'student_id_str' => 'STU-1047',
        'student_email' => 'sneha@gmail.com',
        'student_phone' => '+91 98765 43212',
        'student_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'instructor_name' => 'Rahul Sinha',
        'instructor_id_str' => 'INS-2585',
        'instructor_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        'booking_ref' => 'INS-2585',
        'booking_code' => 'BK-7890',
        'rating' => 5,
        'review_text' => 'Great lesson! Passed my driving test on the first go in Silverwater test centre! Couldn\'t have done it without them.',
        'date_str' => '10 Sep 2025',
        'submitted_at' => '2025-09-10 16:40:00',
        'lesson_type' => 'Manual',
        'admin_response' => 'Congratulations on passing your test on the first attempt! Drive safe! - EZY 2 LEARN Team',
        'admin_response_at' => '2025-09-10 18:00:00',
        'status' => 'approved',
    ],
    [
        'student_name' => 'Aman Verma',
        'student_id_str' => 'STU-1048',
        'student_email' => 'aman@gmail.com',
        'student_phone' => '+91 98765 43213',
        'student_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        'instructor_name' => 'Priya Nair',
        'instructor_id_str' => 'INS-2584',
        'instructor_avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        'booking_ref' => 'INS-2584',
        'booking_code' => 'BK-7889',
        'rating' => 3,
        'review_text' => 'Good teaching techniques, but the session started 10 minutes late due to traffic delay.',
        'date_str' => '09 Sep 2025',
        'submitted_at' => '2025-09-09 09:20:00',
        'lesson_type' => 'Automatic',
        'admin_response' => null,
        'admin_response_at' => null,
        'status' => 'approved',
    ],
    [
        'student_name' => 'Neha Kapoor',
        'student_id_str' => 'STU-1049',
        'student_email' => 'neha@gmail.com',
        'student_phone' => '+91 98765 43214',
        'student_avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        'instructor_name' => 'Daniel Okafor',
        'instructor_id_str' => 'INS-2583',
        'instructor_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        'booking_ref' => 'INS-2583',
        'booking_code' => 'BK-7888',
        'rating' => 5,
        'review_text' => 'Very professional approach, clean and dual-controlled vehicle, gave clear and calm guidance throughout.',
        'date_str' => '08 Sep 2025',
        'submitted_at' => '2025-09-08 11:15:00',
        'lesson_type' => 'Automatic',
        'admin_response' => 'Thank you so much Neha! It was a pleasure teaching you. - EZY 2 LEARN Team',
        'admin_response_at' => '2025-09-09 10:00:00',
        'status' => 'approved',
    ],
    [
        'student_name' => 'Karan Singh',
        'student_id_str' => 'STU-1050',
        'student_email' => 'karan@gmail.com',
        'student_phone' => '+91 98765 43215',
        'student_avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        'instructor_name' => 'Sofia Reyes',
        'instructor_id_str' => 'INS-2582',
        'instructor_avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        'booking_ref' => 'INS-2582',
        'booking_code' => 'BK-7887',
        'rating' => 3,
        'review_text' => 'It was okay. Covered basic manoeuvres, but felt a bit rushed towards the end.',
        'date_str' => '07 Sep 2025',
        'submitted_at' => '2025-09-07 15:30:00',
        'lesson_type' => 'Manual',
        'admin_response' => null,
        'admin_response_at' => null,
        'status' => 'approved',
    ],
    [
        'student_name' => 'Diya Sharma',
        'student_id_str' => 'STU-1051',
        'student_email' => 'diya@gmail.com',
        'student_phone' => '+91 98765 43216',
        'student_avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        'instructor_name' => 'Rahul Sinha',
        'instructor_id_str' => 'INS-2581',
        'instructor_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        'booking_ref' => 'INS-2581',
        'booking_code' => 'BK-7886',
        'rating' => 5,
        'review_text' => 'Amazing service! Highly knowledgeable instructors who know every inch of the NSW RMS test routes.',
        'date_str' => '06 Sep 2025',
        'submitted_at' => '2025-09-06 13:00:00',
        'lesson_type' => 'Automatic',
        'admin_response' => 'Thanks Diya! We are delighted you enjoyed your driving lessons! - EZY 2 LEARN Team',
        'admin_response_at' => '2025-09-07 09:30:00',
        'status' => 'approved',
    ],
];

// Ensure Rahul Sinha exists as instructor in DB
$chkInst = $db->prepare("SELECT id FROM instructors WHERE name = 'Rahul Sinha'");
$chkInst->execute();
$rahulId = $chkInst->fetchColumn();
if (!$rahulId) {
    $db->prepare("
        INSERT INTO instructors (instructor_code, name, email, phone, transmission, vehicle_make, vehicle_model, vehicle_year, vehicle_rego, service_areas, rating, total_reviews, status, accreditation_number)
        VALUES ('INS-2587', 'Rahul Sinha', 'rahul@ezy2learn.com', '+61 412 999 888', 'both', 'Toyota', 'Camry', 2023, 'NSW-RAH888', 'Parramatta, Westmead', 4.9, 110, 'active', 'RMS-DI-88225')
    ")->execute();
    $rahulId = (int)$db->lastInsertId();
    echo "Inserted Rahul Sinha into instructors\n";
}

// Clear old sample reviews or update
$db->exec("DELETE FROM reviews WHERE student_name IN ('Priya Sharma', 'Rohan Mehta', 'Sneha Patel', 'Aman Verma', 'Neha Kapoor', 'Karan Singh', 'Diya Sharma')");

foreach ($reviewsData as $r) {
    // lookup or create student
    $sStmt = $db->prepare("SELECT id FROM students WHERE name = ?");
    $sStmt->execute([$r['student_name']]);
    $stuId = $sStmt->fetchColumn();

    if (!$stuId) {
        $db->prepare("
            INSERT INTO students (student_code, name, email, phone, suburb, postcode, licence_stage, status, avatar_url)
            VALUES (?, ?, ?, ?, 'Parramatta', '2150', 'learner', 'active', ?)
        ")->execute([$r['student_id_str'], $r['student_name'], $r['student_email'], $r['student_phone'], $r['student_avatar']]);
        $stuId = (int)$db->lastInsertId();
    }

    // lookup instructor
    $iStmt = $db->prepare("SELECT id FROM instructors WHERE name = ?");
    $iStmt->execute([$r['instructor_name']]);
    $instId = $iStmt->fetchColumn() ?: $rahulId;

    $ins = $db->prepare("
        INSERT INTO reviews (
            student_id, instructor_id, student_name, rating, review_text, status,
            booking_ref, lesson_type, admin_response, admin_response_at, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $ins->execute([
        $stuId, $instId, $r['student_name'], $r['rating'], $r['review_text'], $r['status'],
        $r['booking_code'], $r['lesson_type'], $r['admin_response'], $r['admin_response_at'], $r['submitted_at']
    ]);
    echo "Inserted review for {$r['student_name']}\n";
}

echo "Reviews seeded successfully!\n";
