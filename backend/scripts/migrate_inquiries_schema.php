<?php
require_once dirname(__DIR__) . '/config/database.php';
$db = Database::getConnection();

// 1. Add subject column if not present
try {
    $db->exec("ALTER TABLE inquiries ADD COLUMN subject VARCHAR(255) NULL AFTER name");
    echo "Added subject column.\n";
} catch (Exception $e) {
    echo "subject column already exists or: " . $e->getMessage() . "\n";
}

// 2. Change status to VARCHAR(50)
try {
    $db->exec("ALTER TABLE inquiries MODIFY COLUMN status VARCHAR(50) DEFAULT 'new'");
    echo "Modified status column to VARCHAR(50).\n";
} catch (Exception $e) {
    echo "Error modifying status: " . $e->getMessage() . "\n";
}

// 3. Seed/Update sample inquiries from reference image
$referenceInquiries = [
    [
        'name' => 'Priya Sharma',
        'subject' => 'Driving Lesson Query',
        'email' => 'priya@gmail.com',
        'phone' => '+91 98765 43210',
        'message' => 'Can you please share details about your beginner packages?',
        'status' => 'new',
        'created_at' => '2025-11-16 10:24:00',
        'suburb' => 'Parramatta',
        'lesson_type' => 'Automatic Driving Lessons',
        'notes' => 'Looking for complete beginner starter package.'
    ],
    [
        'name' => 'Rohan Kumar',
        'subject' => 'Pricing Information',
        'email' => 'rohan.k@gmail.com',
        'phone' => '+91 98123 45678',
        'message' => 'What are the prices for manual driving lesson packages in Parramatta?',
        'status' => 'replied',
        'created_at' => '2025-11-15 14:10:00',
        'suburb' => 'Westmead',
        'lesson_type' => 'Manual Driving Lessons',
        'notes' => 'Sent pricing catalog via email and SMS.'
    ],
    [
        'name' => 'Sneha Nair',
        'subject' => 'Package Details',
        'email' => 'sneha.n@gmail.com',
        'phone' => '+91 97654 32109',
        'message' => 'I want to know the breakdown of 10 lessons package and bonus logbook hours.',
        'status' => 'new',
        'created_at' => '2025-11-14 09:15:00',
        'suburb' => 'Blacktown',
        'lesson_type' => 'Complete Beginner Package',
        'notes' => 'Interested in 3-for-1 bonus hours scheme.'
    ],
    [
        'name' => 'Aman Verma',
        'subject' => 'Book a Lesson',
        'email' => 'aman.v@gmail.com',
        'phone' => '+91 93456 78901',
        'message' => 'Need automatic lesson slot for upcoming Saturday morning with dual-control vehicle.',
        'status' => 'replied',
        'created_at' => '2025-11-13 16:40:00',
        'suburb' => 'Sydney CBD',
        'lesson_type' => 'Automatic Driving Lessons',
        'notes' => 'Confirmed Saturday 10:00 AM slot.'
    ],
    [
        'name' => 'Divya Kapoor',
        'subject' => 'Licence Requirements',
        'email' => 'divya.k@gmail.com',
        'phone' => '+91 99887 76655',
        'message' => 'What documents are needed for overseas licence conversion to NSW full licence?',
        'status' => 'new',
        'created_at' => '2025-11-12 11:20:00',
        'suburb' => 'Castle Hill',
        'lesson_type' => 'Overseas Licence Conversion',
        'notes' => 'Indian driving licence holder converting to NSW full licence.'
    ],
    [
        'name' => 'Oliver Smith',
        'subject' => 'RMS Test Route Preparation',
        'email' => 'oliver.smith99@gmail.com',
        'phone' => '+61 412 884 102',
        'message' => 'Hi, I need to start driving lessons next week. Looking for an experienced instructor who knows the Silverwater RMS test route.',
        'status' => 'new',
        'created_at' => '2025-11-11 15:30:00',
        'suburb' => 'Silverwater',
        'lesson_type' => 'RMS Practical Test Package',
        'notes' => 'Test booked in 3 weeks.'
    ],
    [
        'name' => 'Charlotte Brown',
        'subject' => 'Manual Transmission Lessons',
        'email' => 'charlotte.b@outlook.com',
        'phone' => '+61 423 719 550',
        'message' => 'Hello team, I want to learn manual transmission driving. I currently have a green P plate for automatic and want to upgrade to manual.',
        'status' => 'replied',
        'created_at' => '2025-11-10 13:45:00',
        'suburb' => 'Ryde',
        'lesson_type' => 'Manual Driving Lessons',
        'notes' => 'Scheduled 2-hour manual intro.'
    ],
    [
        'name' => 'Liam Wilson',
        'subject' => 'Mock Driving Test Booking',
        'email' => 'liam.wilson@sydneyuni.edu.au',
        'phone' => '+61 435 902 441',
        'message' => 'My driving test is booked at Castle Hill Service NSW on 28th Nov. Can I hire the instructor car with a 1-hour warm-up lesson before the test?',
        'status' => 'contacted',
        'created_at' => '2025-11-09 10:00:00',
        'suburb' => 'Castle Hill',
        'lesson_type' => 'RMS Practical Test Package',
        'notes' => 'Warmup test booked.'
    ],
    [
        'name' => 'Ethan Nguyen',
        'subject' => 'Beginner 10-Lesson Package Inquiry',
        'email' => 'ethan.nguyen@gmail.com',
        'phone' => '+61 450 339 188',
        'message' => 'Looking for pricing and availability for a 10-lesson package. Never driven before.',
        'status' => 'replied',
        'created_at' => '2025-11-08 17:15:00',
        'suburb' => 'Liverpool',
        'lesson_type' => 'Complete Beginner Package',
        'notes' => 'Quoted $750 package with 3-for-1 logbook hours.'
    ],
    [
        'name' => 'Sophia Taylor',
        'subject' => 'Motorway Confidence Training',
        'email' => 'sophia.t@icloud.com',
        'phone' => '+61 411 776 209',
        'message' => 'I passed my test 6 months ago but feel very anxious driving on the M2 and M4 motorways. Do you offer motorway confidence sessions?',
        'status' => 'new',
        'created_at' => '2025-11-07 14:00:00',
        'suburb' => 'Ryde',
        'lesson_type' => 'Defensive Driving & Highway Confidence',
        'notes' => 'Motorway confidence session requested.'
    ],
    [
        'name' => 'Marcus Vance',
        'subject' => 'Night Driving Hours',
        'email' => 'marcus.v@gmail.com',
        'phone' => '+61 418 223 991',
        'message' => 'Need 10 night hours completed in my logbook before end of year. Are evening sessions available after 7 PM?',
        'status' => 'new',
        'created_at' => '2025-11-06 18:30:00',
        'suburb' => 'Parramatta',
        'lesson_type' => 'Night Driving Special',
        'notes' => 'Night driving specialist requested.'
    ],
    [
        'name' => 'Ananya Roy',
        'subject' => 'Dual Control Car Test Hire',
        'email' => 'ananya.roy@yahoo.com',
        'phone' => '+91 98451 22334',
        'message' => 'Need car hire for driving test at Silverwater test centre. Does it include insurance and instructor accompaniment?',
        'status' => 'replied',
        'created_at' => '2025-11-05 11:10:00',
        'suburb' => 'Silverwater',
        'lesson_type' => 'RMS Test Car Hire',
        'notes' => 'Confirmed insurance coverage and dual controls.'
    ]
];

// Insert or update inquiries
foreach ($referenceInquiries as $inq) {
    // Check if exists by email
    $checkStmt = $db->prepare("SELECT id FROM inquiries WHERE email = ?");
    $checkStmt->execute([$inq['email']]);
    $existingId = $checkStmt->fetchColumn();

    if ($existingId) {
        $updateStmt = $db->prepare("
            UPDATE inquiries SET
                name = ?, subject = ?, phone = ?, message = ?, status = ?,
                suburb = ?, lesson_type = ?, notes = ?, created_at = ?
            WHERE id = ?
        ");
        $updateStmt->execute([
            $inq['name'], $inq['subject'], $inq['phone'], $inq['message'],
            $inq['status'], $inq['suburb'], $inq['lesson_type'], $inq['notes'],
            $inq['created_at'], $existingId
        ]);
    } else {
        $insertStmt = $db->prepare("
            INSERT INTO inquiries (
                name, subject, email, phone, message, status, suburb, lesson_type, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $insertStmt->execute([
            $inq['name'], $inq['subject'], $inq['email'], $inq['phone'], $inq['message'],
            $inq['status'], $inq['suburb'], $inq['lesson_type'], $inq['notes'], $inq['created_at']
        ]);
    }
}

echo "Seeded/updated " . count($referenceInquiries) . " reference inquiries successfully.\n";
