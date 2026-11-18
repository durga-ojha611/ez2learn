<?php
require 'backend/config/database.php';
$db = Database::getConnection();

// 1. Add columns to services if not present
$colsServices = $db->query("DESCRIBE services")->fetchAll(PDO::FETCH_COLUMN);
if (!in_array('subtitle', $colsServices)) {
    $db->exec("ALTER TABLE services ADD COLUMN subtitle VARCHAR(255) NULL AFTER name");
    echo "Added subtitle to services\n";
}
if (!in_array('image_url', $colsServices)) {
    $db->exec("ALTER TABLE services ADD COLUMN image_url VARCHAR(500) NULL AFTER description");
    echo "Added image_url to services\n";
}
// Change category column to VARCHAR(100) so it supports 'Lessons', 'Courses', 'Training', 'Advanced' etc.
$db->exec("ALTER TABLE services MODIFY COLUMN category VARCHAR(100) DEFAULT 'Lessons'");

// 2. Add columns to packages if not present
$colsPackages = $db->query("DESCRIBE packages")->fetchAll(PDO::FETCH_COLUMN);
if (!in_array('package_type', $colsPackages)) {
    $db->exec("ALTER TABLE packages ADD COLUMN package_type VARCHAR(100) DEFAULT 'Lesson Package' AFTER name");
    echo "Added package_type to packages\n";
}
if (!in_array('validity', $colsPackages)) {
    $db->exec("ALTER TABLE packages ADD COLUMN validity VARCHAR(50) DEFAULT '3 Months' AFTER duration_per_lesson");
    echo "Added validity to packages\n";
}
if (!in_array('image_url', $colsPackages)) {
    $db->exec("ALTER TABLE packages ADD COLUMN image_url VARCHAR(500) NULL AFTER description");
    echo "Added image_url to packages\n";
}

// 3. Seed / Update Services to match Image 1
$initialServices = [
    [
        'id' => 1,
        'name' => 'Driving Lessons',
        'subtitle' => 'Manual & Automatic',
        'slug' => 'driving-lessons',
        'category' => 'Lessons',
        'duration_minutes' => 60,
        'price_aud' => 80.00,
        'description' => 'Comprehensive manual and automatic driving lessons tailored to learner drivers of all experience levels.',
        'image_url' => 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&auto=format&fit=crop&q=80',
        'included_features' => ['Professional instructors', 'Modern vehicles', 'Flexible scheduling', 'Door-to-door pickup'],
        'is_active' => 1,
        'sort_order' => 1,
        'updated_at' => '2026-11-15 10:30:00'
    ],
    [
        'id' => 2,
        'name' => 'Refresher Course',
        'subtitle' => 'Improve your skills',
        'slug' => 'refresher-course',
        'category' => 'Courses',
        'duration_minutes' => 60,
        'price_aud' => 85.00,
        'description' => 'Targeted booster driving course designed for licensed drivers wishing to regain road confidence or update their road knowledge.',
        'image_url' => 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=80',
        'included_features' => ['Confidence building', 'Parking & highway skills', 'Experienced trainers', 'Custom route practice'],
        'is_active' => 1,
        'sort_order' => 2,
        'updated_at' => '2026-11-12 14:15:00'
    ],
    [
        'id' => 3,
        'name' => 'Defensive Driving',
        'subtitle' => 'Drive safely always',
        'slug' => 'defensive-driving',
        'category' => 'Courses',
        'duration_minutes' => 90,
        'price_aud' => 110.00,
        'description' => 'Learn hazard perception, wet weather braking, safe following distances, and crisis collision avoidance.',
        'image_url' => 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&auto=format&fit=crop&q=80',
        'included_features' => ['Hazard perception', 'Emergency braking', 'Road safety certificate', 'Wet weather handling'],
        'is_active' => 1,
        'sort_order' => 3,
        'updated_at' => '2026-11-10 09:45:00'
    ],
    [
        'id' => 4,
        'name' => 'Driving Test Prep',
        'subtitle' => 'Pass with confidence',
        'slug' => 'driving-test-prep',
        'category' => 'Training',
        'duration_minutes' => 120,
        'price_aud' => 150.00,
        'description' => 'Realistic simulation exam on actual Service NSW testing routes, with score grading and critical error remediation.',
        'image_url' => 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=400&auto=format&fit=crop&q=80',
        'included_features' => ['Official test route practice', 'Mock test scoring', 'Reverse parallel parking', 'Fail-item avoidance'],
        'is_active' => 1,
        'sort_order' => 4,
        'updated_at' => '2026-11-08 16:20:00'
    ],
    [
        'id' => 5,
        'name' => 'Advanced Driving',
        'subtitle' => 'For experienced drivers',
        'slug' => 'advanced-driving',
        'category' => 'Advanced',
        'duration_minutes' => 90,
        'price_aud' => 135.00,
        'description' => 'Advanced vehicle dynamics, multi-lane high-speed traffic negotiation, and precision night driving techniques.',
        'image_url' => 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=80',
        'included_features' => ['High-speed motorway driving', 'Precision vehicle control', 'Night-time hazard mastery', 'Performance dynamics'],
        'is_active' => 0,
        'sort_order' => 5,
        'updated_at' => '2026-11-01 11:00:00'
    ],
];

// Clean out non-matching services and insert/update the 5 exact reference services
$db->exec("DELETE FROM services WHERE id > 5");
foreach ($initialServices as $s) {
    $stmt = $db->prepare("
        INSERT INTO services (id, name, subtitle, slug, category, transmission, duration_minutes, price_aud, description, image_url, included_features, is_active, sort_order, updated_at)
        VALUES (?, ?, ?, ?, ?, 'both', ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            subtitle = VALUES(subtitle),
            category = VALUES(category),
            duration_minutes = VALUES(duration_minutes),
            price_aud = VALUES(price_aud),
            description = VALUES(description),
            image_url = VALUES(image_url),
            included_features = VALUES(included_features),
            is_active = VALUES(is_active),
            sort_order = VALUES(sort_order),
            updated_at = VALUES(updated_at)
    ");
    $stmt->execute([
        $s['id'],
        $s['name'],
        $s['subtitle'],
        $s['slug'],
        $s['category'],
        $s['duration_minutes'],
        $s['price_aud'],
        $s['description'],
        $s['image_url'],
        json_encode($s['included_features']),
        $s['is_active'],
        $s['sort_order'],
        $s['updated_at']
    ]);
}
echo "Services seeded and updated.\n";

// 4. Seed / Update Packages matching Image 3 and prompt specifications
$initialPackages = [
    [
        'id' => 1,
        'name' => 'Beginner Package',
        'package_type' => 'Lesson Package',
        'slug' => 'beginner-package',
        'lesson_count' => 5,
        'duration_per_lesson' => 60,
        'validity' => '3 Months',
        'price_aud' => 350.00,
        'discount_amount' => 50.00,
        'description' => 'Perfect for new drivers. Includes 5 professional driving lessons with structured logbook verification.',
        'image_url' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80',
        'features' => ['5 Driving Lessons', 'Progress Tracking', 'Certificate of Completion', 'NSW 3-for-1 Bonus Hours'],
        'popular_badge' => 1,
        'is_active' => 1,
    ],
    [
        'id' => 2,
        'name' => 'Intermediate Package',
        'package_type' => 'Lesson Package',
        'slug' => 'intermediate-package',
        'lesson_count' => 10,
        'duration_per_lesson' => 60,
        'validity' => '6 Months',
        'price_aud' => 680.00,
        'discount_amount' => 120.00,
        'description' => 'For improving driving skills, road positioning, complex roundabouts, and busy urban traffic confidence.',
        'image_url' => 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=500&auto=format&fit=crop&q=80',
        'features' => ['10 Driving Lessons', '30 Logbook Hours (Max 3-for-1)', 'Highway & Night Driving', 'Free Mock Test Included'],
        'popular_badge' => 0,
        'is_active' => 1,
    ],
    [
        'id' => 3,
        'name' => 'Test Preparation Package',
        'package_type' => 'Test Prep',
        'slug' => 'test-preparation-package',
        'lesson_count' => 3,
        'duration_per_lesson' => 90,
        'validity' => '2 Months',
        'price_aud' => 290.00,
        'discount_amount' => 45.00,
        'description' => 'For practical driving tests. Combines route preparation, error analysis, and test day dual-control vehicle hire.',
        'image_url' => 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&auto=format&fit=crop&q=80',
        'features' => ['3 x 90-min Sessions', 'Test Day Car Hire Included', 'Actual RMS Exam Routes', 'Instructor Support at Testing Centre'],
        'popular_badge' => 0,
        'is_active' => 1,
    ],
    [
        'id' => 4,
        'name' => 'Automatic Package',
        'package_type' => 'Lesson Package',
        'slug' => 'automatic-package',
        'lesson_count' => 5,
        'duration_per_lesson' => 60,
        'validity' => '3 Months',
        'price_aud' => 360.00,
        'discount_amount' => 40.00,
        'description' => 'Automatic driving lessons in modern 5-star ANCAP safety vehicles with dual controls.',
        'image_url' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=80',
        'features' => ['5 Automatic Lessons', 'Dual Controls Vehicle', 'Flexible Rescheduling', 'Door-to-door Pickup'],
        'popular_badge' => 0,
        'is_active' => 1,
    ],
];

$db->exec("DELETE FROM packages WHERE id > 4");
foreach ($initialPackages as $p) {
    $stmt = $db->prepare("
        INSERT INTO packages (id, name, package_type, slug, lesson_count, duration_per_lesson, validity, price_aud, discount_amount, description, image_url, features, popular_badge, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            package_type = VALUES(package_type),
            lesson_count = VALUES(lesson_count),
            duration_per_lesson = VALUES(duration_per_lesson),
            validity = VALUES(validity),
            price_aud = VALUES(price_aud),
            discount_amount = VALUES(discount_amount),
            description = VALUES(description),
            image_url = VALUES(image_url),
            features = VALUES(features),
            popular_badge = VALUES(popular_badge),
            is_active = VALUES(is_active)
    ");
    $stmt->execute([
        $p['id'],
        $p['name'],
        $p['package_type'],
        $p['slug'],
        $p['lesson_count'],
        $p['duration_per_lesson'],
        $p['validity'],
        $p['price_aud'],
        $p['discount_amount'],
        $p['description'],
        $p['image_url'],
        json_encode($p['features']),
        $p['popular_badge'],
        $p['is_active'],
    ]);
}
echo "Packages seeded and updated.\n";
