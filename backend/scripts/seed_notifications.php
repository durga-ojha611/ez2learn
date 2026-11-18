<?php
require_once __DIR__ . '/../config/database.php';
$pdo = Database::getConnection();

// Check if notifications exist
$count = (int)$pdo->query("SELECT COUNT(*) FROM notifications")->fetchColumn();
if ($count === 0) {
    $notifications = [
        [
            'title' => 'New Booking Confirmed',
            'message' => 'Aman Verma booked Driving Lessons (Automatic) with Rohan Mehta for 27 Nov 2026 at 11:30 AM.',
            'category' => 'booking',
            'related_id' => 35,
            'link_url' => '/bookings/35',
            'is_read' => 0,
            'created_at' => '2026-11-18 10:30:00'
        ],
        [
            'title' => 'Payment Received - $85.00',
            'message' => 'Online payment received from Aman Verma via Credit Card for Booking #BK-1027.',
            'category' => 'payment',
            'related_id' => 23,
            'link_url' => '/payments',
            'is_read' => 0,
            'created_at' => '2026-11-18 10:32:00'
        ],
        [
            'title' => 'Lesson Completed & Logbook Verified',
            'message' => 'Karan Singh completed 60 mins manual driving lesson with Rohan Mehta. 3 bonus hours credited to NSW logbook.',
            'category' => 'student',
            'related_id' => 34,
            'link_url' => '/bookings/34',
            'is_read' => 0,
            'created_at' => '2026-11-18 09:15:00'
        ],
        [
            'title' => 'Accreditation Document Notice',
            'message' => 'Instructor Sofia Reyes accreditation renewal is scheduled for review. Certificate expires in 90 days.',
            'category' => 'instructor',
            'related_id' => 9,
            'link_url' => '/instructors/9',
            'is_read' => 1,
            'created_at' => '2026-11-17 14:00:00'
        ],
        [
            'title' => '5-Star Review Received',
            'message' => 'Liam Walker left a 5-star review: "Kevin is patient, super encouraging, and really explains the NSW road rules clearly."',
            'category' => 'review',
            'related_id' => 4,
            'link_url' => '/reviews',
            'is_read' => 1,
            'created_at' => '2026-11-17 11:20:00'
        ],
        [
            'title' => 'New Student Registration',
            'message' => 'Rohit Mehta registered for Learner driving lessons in Parramatta & Sydney CBD.',
            'category' => 'student',
            'related_id' => 22,
            'link_url' => '/students/22',
            'is_read' => 0,
            'created_at' => '2026-11-16 16:45:00'
        ],
        [
            'title' => 'Vehicle Dual-Control Compliance',
            'message' => 'Rohan Mehta Toyota Corolla (Manual) RMS dual-control certificate verified and approved.',
            'category' => 'instructor',
            'related_id' => 11,
            'link_url' => '/instructors/11',
            'is_read' => 1,
            'created_at' => '2026-11-15 13:10:00'
        ],
        [
            'title' => 'Package Purchased - Beginner Pack',
            'message' => 'Sneha Patel enrolled in 5-Lesson Beginner Package ($350.00). Transaction #TXN-7824 settled.',
            'category' => 'payment',
            'related_id' => 15,
            'link_url' => '/payments',
            'is_read' => 1,
            'created_at' => '2026-11-14 09:00:00'
        ],
    ];

    $stmt = $pdo->prepare("INSERT INTO notifications (title, message, category, related_id, link_url, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($notifications as $n) {
        $stmt->execute([
            $n['title'],
            $n['message'],
            $n['category'],
            $n['related_id'],
            $n['link_url'],
            $n['is_read'],
            $n['created_at']
        ]);
    }
    echo "Seeded " . count($notifications) . " notifications successfully!\n";
} else {
    echo "Notifications already exist: $count\n";
}
