<?php
// backend/scripts/migrate_and_seed.php
require_once __DIR__ . '/../config/database.php';
$db = Database::getConnection();

echo "1. Altering MySQL Tables to ensure all fields exist...\n";

// Helper function to safely add column if not exists
function addColIfNotExists($db, $table, $col, $type) {
    $stmt = $db->query("SHOW COLUMNS FROM `$table` LIKE '$col'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE `$table` ADD COLUMN `$col` $type");
        echo " - Added `$col` to `$table`\n";
    } else {
        echo " - `$col` already in `$table`\n";
    }
}

// 1. INSTRUCTORS
addColIfNotExists($db, 'instructors', 'instructor_code', "VARCHAR(30) NULL");
addColIfNotExists($db, 'instructors', 'service_areas', "TEXT NULL");
addColIfNotExists($db, 'instructors', 'active_learners', "INT DEFAULT 0");
addColIfNotExists($db, 'instructors', 'total_lessons', "INT DEFAULT 0");
addColIfNotExists($db, 'instructors', 'accreditation_expiry', "DATE NULL");

// Modify status enum if needed
try {
    $db->exec("ALTER TABLE `instructors` MODIFY COLUMN `status` ENUM('active', 'inactive', 'on_leave', 'onboarding', 'pending_approval', 'suspended') DEFAULT 'active'");
} catch (Exception $e) {
    echo "Instructor status enum notice: " . $e->getMessage() . "\n";
}

// 2. STUDENTS
addColIfNotExists($db, 'students', 'student_code', "VARCHAR(30) NULL");
addColIfNotExists($db, 'students', 'first_name', "VARCHAR(100) NULL");
addColIfNotExists($db, 'students', 'last_name', "VARCHAR(100) NULL");
addColIfNotExists($db, 'students', 'licence_status', "VARCHAR(50) DEFAULT 'Valid'");
addColIfNotExists($db, 'students', 'remaining_lessons', "INT DEFAULT 0");
addColIfNotExists($db, 'students', 'pending_payments', "DECIMAL(10,2) DEFAULT 0.00");

// 3. BOOKINGS
addColIfNotExists($db, 'bookings', 'lesson_package', "VARCHAR(100) NULL");
addColIfNotExists($db, 'bookings', 'lesson_category', "VARCHAR(100) NULL");
addColIfNotExists($db, 'bookings', 'number_of_lessons', "INT DEFAULT 1");
addColIfNotExists($db, 'bookings', 'discount_aud', "DECIMAL(10,2) DEFAULT 0.00");
addColIfNotExists($db, 'bookings', 'final_amount_aud', "DECIMAL(10,2) DEFAULT 0.00");
addColIfNotExists($db, 'bookings', 'payment_method', "VARCHAR(50) DEFAULT 'Credit Card'");
addColIfNotExists($db, 'bookings', 'transaction_id', "VARCHAR(100) NULL");
addColIfNotExists($db, 'bookings', 'student_notes', "TEXT NULL");
addColIfNotExists($db, 'bookings', 'special_requirements', "TEXT NULL");
addColIfNotExists($db, 'bookings', 'admin_notes', "TEXT NULL");
addColIfNotExists($db, 'bookings', 'rescheduling_history', "TEXT NULL");

try {
    $db->exec("ALTER TABLE `bookings` MODIFY COLUMN `booking_status` ENUM('upcoming', 'new_request', 'pending', 'confirmed', 'assigned', 'completed', 'cancelled', 'rescheduled') DEFAULT 'pending'");
} catch (Exception $e) {
    echo "Booking status enum notice: " . $e->getMessage() . "\n";
}

echo "\n2. Seeding Required Instructors (Daniel Okafor, Priya Nair, Marcus Bell, Sofia Reyes, David Kim)...\n";

$instructorsSeed = [
    [
        'code' => 'INST-001',
        'name' => 'Daniel Okafor',
        'email' => 'daniel@ezy2learn.com',
        'phone' => '+61 412 111 222',
        'transmission' => 'manual',
        'vehicle_make' => 'Toyota',
        'vehicle_model' => 'Camry',
        'vehicle_year' => 2023,
        'vehicle_rego' => 'NSW-CAM901',
        'service_areas' => 'Parramatta, Harris Park, Rosehill, Westmead',
        'rating' => 4.9,
        'total_reviews' => 142,
        'active_learners' => 18,
        'total_lessons' => 384,
        'accreditation_number' => 'RMS-DI-88219',
        'accreditation_expiry' => '2028-06-30',
        'experience_years' => 9,
        'status' => 'active',
        'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'INST-002',
        'name' => 'Priya Nair',
        'email' => 'priya@ezy2learn.com',
        'phone' => '+61 423 222 333',
        'transmission' => 'automatic',
        'vehicle_make' => 'Honda',
        'vehicle_model' => 'Civic',
        'vehicle_year' => 2024,
        'vehicle_rego' => 'NSW-CIV410',
        'service_areas' => 'Westmead, Wentworthville, Blacktown, Seven Hills',
        'rating' => 4.8,
        'total_reviews' => 118,
        'active_learners' => 15,
        'total_lessons' => 312,
        'accreditation_number' => 'RMS-DI-88220',
        'accreditation_expiry' => '2027-11-15',
        'experience_years' => 7,
        'status' => 'active',
        'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'INST-003',
        'name' => 'Marcus Bell',
        'email' => 'marcus@ezy2learn.com',
        'phone' => '+61 434 333 444',
        'transmission' => 'manual',
        'vehicle_make' => 'Toyota',
        'vehicle_model' => 'Corolla',
        'vehicle_year' => 2022,
        'vehicle_rego' => 'NSW-COR772',
        'service_areas' => 'Blacktown, Doonside, Marayong, Prospect',
        'rating' => 4.7,
        'total_reviews' => 96,
        'active_learners' => 12,
        'total_lessons' => 260,
        'accreditation_number' => 'RMS-DI-88221',
        'accreditation_expiry' => '2028-01-20',
        'experience_years' => 6,
        'status' => 'active',
        'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'INST-004',
        'name' => 'Sofia Reyes',
        'email' => 'sofia@ezy2learn.com',
        'phone' => '+61 445 444 555',
        'transmission' => 'automatic',
        'vehicle_make' => 'Hyundai',
        'vehicle_model' => 'i30',
        'vehicle_year' => 2023,
        'vehicle_rego' => 'NSW-HYU305',
        'service_areas' => 'Liverpool, Casula, Moorebank, Cabramatta',
        'rating' => 4.8,
        'total_reviews' => 104,
        'active_learners' => 14,
        'total_lessons' => 295,
        'accreditation_number' => 'RMS-DI-88222',
        'accreditation_expiry' => '2029-04-10',
        'experience_years' => 8,
        'status' => 'on_leave',
        'avatar_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'INST-005',
        'name' => 'David Kim',
        'email' => 'david@ezy2learn.com',
        'phone' => '+61 456 555 666',
        'transmission' => 'manual',
        'vehicle_make' => 'Mazda',
        'vehicle_model' => '3',
        'vehicle_year' => 2024,
        'vehicle_rego' => 'NSW-MAZ318',
        'service_areas' => 'Chatswood, Artarmon, Roseville, Willoughby',
        'rating' => 4.9,
        'total_reviews' => 130,
        'active_learners' => 16,
        'total_lessons' => 340,
        'accreditation_number' => 'RMS-DI-88223',
        'accreditation_expiry' => '2028-09-12',
        'experience_years' => 10,
        'status' => 'active',
        'avatar_url' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    ],
];

foreach ($instructorsSeed as $inst) {
    $chk = $db->prepare("SELECT id FROM instructors WHERE email = ?");
    $chk->execute([$inst['email']]);
    $id = $chk->fetchColumn();

    if ($id) {
        $upd = $db->prepare("
            UPDATE instructors SET
                instructor_code = ?, name = ?, phone = ?, transmission = ?,
                vehicle_make = ?, vehicle_model = ?, vehicle_year = ?, vehicle_rego = ?,
                service_areas = ?, rating = ?, total_reviews = ?, active_learners = ?,
                total_lessons = ?, accreditation_number = ?, accreditation_expiry = ?,
                experience_years = ?, status = ?, avatar_url = ?
            WHERE id = ?
        ");
        $upd->execute([
            $inst['code'], $inst['name'], $inst['phone'], $inst['transmission'],
            $inst['vehicle_make'], $inst['vehicle_model'], $inst['vehicle_year'], $inst['vehicle_rego'],
            $inst['service_areas'], $inst['rating'], $inst['total_reviews'], $inst['active_learners'],
            $inst['total_lessons'], $inst['accreditation_number'], $inst['accreditation_expiry'],
            $inst['experience_years'], $inst['status'], $inst['avatar_url'], $id
        ]);
        echo " - Updated instructor: {$inst['name']}\n";
    } else {
        $ins = $db->prepare("
            INSERT INTO instructors (
                instructor_code, name, email, phone, transmission,
                vehicle_make, vehicle_model, vehicle_year, vehicle_rego,
                service_areas, rating, total_reviews, active_learners,
                total_lessons, accreditation_number, accreditation_expiry,
                experience_years, status, avatar_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $ins->execute([
            $inst['code'], $inst['name'], $inst['email'], $inst['phone'], $inst['transmission'],
            $inst['vehicle_make'], $inst['vehicle_model'], $inst['vehicle_year'], $inst['vehicle_rego'],
            $inst['service_areas'], $inst['rating'], $inst['total_reviews'], $inst['active_learners'],
            $inst['total_lessons'], $inst['accreditation_number'], $inst['accreditation_expiry'],
            $inst['experience_years'], $inst['status'], $inst['avatar_url']
        ]);
        echo " - Inserted instructor: {$inst['name']}\n";
    }
}

echo "\n3. Seeding Required Students (John Smith, Sarah Wilson, Michael Brown, Emma Davis, Daniel Clark)...\n";

$studentsSeed = [
    [
        'code' => 'STU-001',
        'name' => 'John Smith',
        'first_name' => 'John',
        'last_name' => 'Smith',
        'email' => 'john@mail.com',
        'phone' => '+61 412 111 222',
        'date_of_birth' => '2004-05-18',
        'address' => '10 Bridge Street',
        'suburb' => 'Sydney',
        'postcode' => '2000',
        'licence_stage' => 'learner',
        'licence_status' => 'Valid',
        'licence_number' => 'NSW-L901234',
        'preferred_transmission' => 'manual',
        'instructor_email' => 'daniel@ezy2learn.com',
        'completed_lessons' => 8,
        'remaining_lessons' => 2,
        'status' => 'active',
        'total_spent' => 680.00,
        'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'STU-002',
        'name' => 'Sarah Wilson',
        'first_name' => 'Sarah',
        'last_name' => 'Wilson',
        'email' => 'sarah@mail.com',
        'phone' => '+61 413 222 333',
        'date_of_birth' => '2003-09-24',
        'address' => '45 Church Street',
        'suburb' => 'Parramatta',
        'postcode' => '2150',
        'licence_stage' => 'provisional_p1',
        'licence_status' => 'Valid',
        'licence_number' => 'NSW-P881230',
        'preferred_transmission' => 'automatic',
        'instructor_email' => 'priya@ezy2learn.com',
        'completed_lessons' => 6,
        'remaining_lessons' => 4,
        'status' => 'active',
        'total_spent' => 510.00,
        'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'STU-003',
        'name' => 'Michael Brown',
        'first_name' => 'Michael',
        'last_name' => 'Brown',
        'email' => 'michael@mail.com',
        'phone' => '+61 414 333 444',
        'date_of_birth' => '2005-02-11',
        'address' => '88 Victoria Avenue',
        'suburb' => 'Chatswood',
        'postcode' => '2067',
        'licence_stage' => 'learner',
        'licence_status' => 'Valid',
        'licence_number' => 'NSW-L945671',
        'preferred_transmission' => 'manual',
        'instructor_email' => 'marcus@ezy2learn.com',
        'completed_lessons' => 4,
        'remaining_lessons' => 6,
        'status' => 'active',
        'total_spent' => 340.00,
        'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'STU-004',
        'name' => 'Emma Davis',
        'first_name' => 'Emma',
        'last_name' => 'Davis',
        'email' => 'emma@mail.com',
        'phone' => '+61 415 444 555',
        'date_of_birth' => '2001-11-30',
        'address' => '14 George Street',
        'suburb' => 'Liverpool',
        'postcode' => '2170',
        'licence_stage' => 'full_licence',
        'licence_status' => 'Valid',
        'licence_number' => 'NSW-F102938',
        'preferred_transmission' => 'automatic',
        'instructor_email' => 'sofia@ezy2learn.com',
        'completed_lessons' => 10,
        'remaining_lessons' => 0,
        'status' => 'active',
        'total_spent' => 850.00,
        'avatar_url' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    ],
    [
        'code' => 'STU-005',
        'name' => 'Daniel Clark',
        'first_name' => 'Daniel',
        'last_name' => 'Clark',
        'email' => 'daniel@mail.com',
        'phone' => '+61 416 555 666',
        'date_of_birth' => '2004-07-04',
        'address' => '22 Flushcombe Road',
        'suburb' => 'Blacktown',
        'postcode' => '2148',
        'licence_stage' => 'learner',
        'licence_status' => 'Valid',
        'licence_number' => 'NSW-L772819',
        'preferred_transmission' => 'manual',
        'instructor_email' => 'daniel@ezy2learn.com',
        'completed_lessons' => 3,
        'remaining_lessons' => 7,
        'status' => 'active',
        'total_spent' => 255.00,
        'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ],
];

foreach ($studentsSeed as $stu) {
    // lookup instructor id
    $instId = $db->prepare("SELECT id FROM instructors WHERE email = ?");
    $instId->execute([$stu['instructor_email']]);
    $pId = $instId->fetchColumn() ?: null;

    $chk = $db->prepare("SELECT id FROM students WHERE email = ?");
    $chk->execute([$stu['email']]);
    $sId = $chk->fetchColumn();

    if ($sId) {
        $upd = $db->prepare("
            UPDATE students SET
                student_code = ?, name = ?, first_name = ?, last_name = ?, phone = ?,
                date_of_birth = ?, address = ?, suburb = ?, postcode = ?, licence_stage = ?,
                licence_status = ?, licence_number = ?, preferred_transmission = ?,
                preferred_instructor_id = ?, completed_lessons = ?, remaining_lessons = ?,
                status = ?, total_spent = ?, avatar_url = ?
            WHERE id = ?
        ");
        $upd->execute([
            $stu['code'], $stu['name'], $stu['first_name'], $stu['last_name'], $stu['phone'],
            $stu['date_of_birth'], $stu['address'], $stu['suburb'], $stu['postcode'], $stu['licence_stage'],
            $stu['licence_status'], $stu['licence_number'], $stu['preferred_transmission'],
            $pId, $stu['completed_lessons'], $stu['remaining_lessons'],
            $stu['status'], $stu['total_spent'], $stu['avatar_url'], $sId
        ]);
        echo " - Updated student: {$stu['name']}\n";
    } else {
        $ins = $db->prepare("
            INSERT INTO students (
                student_code, name, first_name, last_name, email, phone,
                date_of_birth, address, suburb, postcode, licence_stage,
                licence_status, licence_number, preferred_transmission,
                preferred_instructor_id, completed_lessons, remaining_lessons,
                status, total_spent, avatar_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $ins->execute([
            $stu['code'], $stu['name'], $stu['first_name'], $stu['last_name'], $stu['email'], $stu['phone'],
            $stu['date_of_birth'], $stu['address'], $stu['suburb'], $stu['postcode'], $stu['licence_stage'],
            $stu['licence_status'], $stu['licence_number'], $stu['preferred_transmission'],
            $pId, $stu['completed_lessons'], $stu['remaining_lessons'],
            $stu['status'], $stu['total_spent'], $stu['avatar_url']
        ]);
        echo " - Inserted student: {$stu['name']}\n";
    }
}

echo "\n4. Seeding Required Bookings (BK-10045, BK-10044, BK-10043, BK-10042, BK-10041)...\n";

$bookingsSeed = [
    [
        'code' => 'BK-10045',
        'student_email' => 'john@mail.com',
        'instructor_email' => 'daniel@ezy2learn.com',
        'transmission' => 'manual',
        'lesson_date' => '2026-11-18',
        'start_time' => '10:00:00',
        'end_time' => '11:00:00',
        'duration_minutes' => 60,
        'lesson_package' => 'Confidence 10',
        'lesson_category' => 'Standard Driving',
        'number_of_lessons' => 10,
        'pickup_address' => '14 Victoria Road',
        'pickup_suburb' => 'Parramatta',
        'pickup_postcode' => '2150',
        'dropoff_address' => '14 Victoria Road, Parramatta NSW',
        'amount_aud' => 85.00,
        'discount_aud' => 0.00,
        'final_amount_aud' => 85.00,
        'booking_status' => 'upcoming',
        'payment_status' => 'paid',
        'payment_method' => 'Credit Card',
        'transaction_id' => 'TXN-10245',
        'student_notes' => 'Needs practice on roundabouts and 3-point turns.',
        'special_requirements' => 'Prefers morning lessons',
        'admin_notes' => 'Confirmed with Daniel Okafor.',
    ],
    [
        'code' => 'BK-10044',
        'student_email' => 'sarah@mail.com',
        'instructor_email' => 'priya@ezy2learn.com',
        'transmission' => 'automatic',
        'lesson_date' => '2026-11-17',
        'start_time' => '14:00:00',
        'end_time' => '15:00:00',
        'duration_minutes' => 60,
        'lesson_package' => 'Starter',
        'lesson_category' => 'RMS Test Warm-up',
        'number_of_lessons' => 5,
        'pickup_address' => '45 Station Road',
        'pickup_suburb' => 'Westmead',
        'pickup_postcode' => '2145',
        'dropoff_address' => '45 Station Road, Westmead NSW',
        'amount_aud' => 85.00,
        'discount_aud' => 10.00,
        'final_amount_aud' => 75.00,
        'booking_status' => 'pending',
        'payment_status' => 'pending',
        'payment_method' => 'UPI / PayID',
        'transaction_id' => 'TXN-10244',
        'student_notes' => 'Silverwater RMS test route orientation.',
        'special_requirements' => 'Dual control automatic car required',
        'admin_notes' => 'Awaiting payment confirmation.',
    ],
    [
        'code' => 'BK-10043',
        'student_email' => 'michael@mail.com',
        'instructor_email' => 'marcus@ezy2learn.com',
        'transmission' => 'manual',
        'lesson_date' => '2026-11-16',
        'start_time' => '11:00:00',
        'end_time' => '12:30:00',
        'duration_minutes' => 90,
        'lesson_package' => 'Test-ready 15',
        'lesson_category' => 'Highway & Merging',
        'number_of_lessons' => 15,
        'pickup_address' => '19 Flushcombe Road',
        'pickup_suburb' => 'Blacktown',
        'pickup_postcode' => '2148',
        'dropoff_address' => '19 Flushcombe Road, Blacktown NSW',
        'amount_aud' => 125.00,
        'discount_aud' => 5.00,
        'final_amount_aud' => 120.00,
        'booking_status' => 'completed',
        'payment_status' => 'paid',
        'payment_method' => 'Credit Card',
        'transaction_id' => 'TXN-10243',
        'student_notes' => 'M4 Motorway merging and lane transitions.',
        'special_requirements' => 'None',
        'admin_notes' => 'Successfully completed, logbook signed.',
    ],
    [
        'code' => 'BK-10042',
        'student_email' => 'emma@mail.com',
        'instructor_email' => 'sofia@ezy2learn.com',
        'transmission' => 'automatic',
        'lesson_date' => '2026-11-15',
        'start_time' => '13:00:00',
        'end_time' => '15:00:00',
        'duration_minutes' => 120,
        'lesson_package' => 'Overseas Conversion',
        'lesson_category' => 'Refresher Session',
        'number_of_lessons' => 1,
        'pickup_address' => '14 George Street',
        'pickup_suburb' => 'Liverpool',
        'pickup_postcode' => '2170',
        'dropoff_address' => '14 George Street, Liverpool NSW',
        'amount_aud' => 200.00,
        'discount_aud' => 0.00,
        'final_amount_aud' => 200.00,
        'booking_status' => 'completed',
        'payment_status' => 'paid',
        'payment_method' => 'PayPal',
        'transaction_id' => 'TXN-10242',
        'student_notes' => 'Overseas licence conversion knowledge check.',
        'special_requirements' => 'English language instruction',
        'admin_notes' => 'Passed full assessment with 98% score.',
    ],
    [
        'code' => 'BK-10041',
        'student_email' => 'daniel@mail.com',
        'instructor_email' => 'daniel@ezy2learn.com',
        'transmission' => 'manual',
        'lesson_date' => '2026-11-14',
        'start_time' => '09:00:00',
        'end_time' => '10:00:00',
        'duration_minutes' => 60,
        'lesson_package' => 'Starter',
        'lesson_category' => 'Beginner Control',
        'number_of_lessons' => 5,
        'pickup_address' => '22 Flushcombe Road',
        'pickup_suburb' => 'Blacktown',
        'pickup_postcode' => '2148',
        'dropoff_address' => '22 Flushcombe Road, Blacktown NSW',
        'amount_aud' => 85.00,
        'discount_aud' => 0.00,
        'final_amount_aud' => 85.00,
        'booking_status' => 'cancelled',
        'payment_status' => 'refunded',
        'payment_method' => 'Credit Card',
        'transaction_id' => 'TXN-10241',
        'student_notes' => 'Clutch pedal control.',
        'special_requirements' => 'Dual control car',
        'admin_notes' => 'Student cancelled due to medical reasons. Refund processed.',
        'cancellation_reason' => 'Student illness with medical certificate',
    ],
];

foreach ($bookingsSeed as $b) {
    $sStmt = $db->prepare("SELECT id FROM students WHERE email = ?");
    $sStmt->execute([$b['student_email']]);
    $studentId = $sStmt->fetchColumn();

    $iStmt = $db->prepare("SELECT id FROM instructors WHERE email = ?");
    $iStmt->execute([$b['instructor_email']]);
    $instructorId = $iStmt->fetchColumn();

    if (!$studentId || !$instructorId) {
        echo " - Skipping booking {$b['code']}: student or instructor missing\n";
        continue;
    }

    $chk = $db->prepare("SELECT id FROM bookings WHERE booking_code = ?");
    $chk->execute([$b['code']]);
    $bId = $chk->fetchColumn();

    if ($bId) {
        $upd = $db->prepare("
            UPDATE bookings SET
                student_id = ?, instructor_id = ?, transmission = ?,
                lesson_date = ?, start_time = ?, end_time = ?, duration_minutes = ?,
                lesson_package = ?, lesson_category = ?, number_of_lessons = ?,
                pickup_address = ?, pickup_suburb = ?, pickup_postcode = ?, dropoff_address = ?,
                amount_aud = ?, discount_aud = ?, final_amount_aud = ?,
                booking_status = ?, payment_status = ?, payment_method = ?, transaction_id = ?,
                student_notes = ?, special_requirements = ?, admin_notes = ?, cancellation_reason = ?
            WHERE id = ?
        ");
        $upd->execute([
            $studentId, $instructorId, $b['transmission'],
            $b['lesson_date'], $b['start_time'], $b['end_time'], $b['duration_minutes'],
            $b['lesson_package'], $b['lesson_category'], $b['number_of_lessons'],
            $b['pickup_address'], $b['pickup_suburb'], $b['pickup_postcode'], $b['dropoff_address'],
            $b['amount_aud'], $b['discount_aud'], $b['final_amount_aud'],
            $b['booking_status'], $b['payment_status'], $b['payment_method'], $b['transaction_id'],
            $b['student_notes'], $b['special_requirements'], $b['admin_notes'], $b['cancellation_reason'] ?? null,
            $bId
        ]);
        echo " - Updated booking: {$b['code']}\n";
    } else {
        $ins = $db->prepare("
            INSERT INTO bookings (
                booking_code, student_id, instructor_id, transmission,
                lesson_date, start_time, end_time, duration_minutes,
                lesson_package, lesson_category, number_of_lessons,
                pickup_address, pickup_suburb, pickup_postcode, dropoff_address,
                amount_aud, discount_aud, final_amount_aud,
                booking_status, payment_status, payment_method, transaction_id,
                student_notes, special_requirements, admin_notes, cancellation_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $ins->execute([
            $b['code'], $studentId, $instructorId, $b['transmission'],
            $b['lesson_date'], $b['start_time'], $b['end_time'], $b['duration_minutes'],
            $b['lesson_package'], $b['lesson_category'], $b['number_of_lessons'],
            $b['pickup_address'], $b['pickup_suburb'], $b['pickup_postcode'], $b['dropoff_address'],
            $b['amount_aud'], $b['discount_aud'], $b['final_amount_aud'],
            $b['booking_status'], $b['payment_status'], $b['payment_method'], $b['transaction_id'],
            $b['student_notes'], $b['special_requirements'], $b['admin_notes'], $b['cancellation_reason'] ?? null
        ]);
        echo " - Inserted booking: {$b['code']}\n";
    }
}

echo "\nDatabase migration and seeding completed successfully!\n";
