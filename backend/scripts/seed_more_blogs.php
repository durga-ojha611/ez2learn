<?php
require_once __DIR__ . '/../config/database.php';
$db = Database::getConnection();

// Fix Kevin O'Connor title & author
$db->exec("UPDATE blogs SET 
    title = 'Top 10 Reasons Learners Fail the NSW Driving Test (And How to Avoid Them)',
    author_name = 'Kevin O\'Connor',
    publisher_name = 'Kevin O\'Connor'
WHERE id = 1");

// Insert 2 more driving school articles if not exists
$check4 = $db->query("SELECT id FROM blogs WHERE id = 4")->fetch();
if (!$check4) {
    $stmt = $db->prepare("INSERT INTO blogs (id, title, slug, featured_image, image_url, author_name, publisher_name, category, summary, description, content, body, status, seo_title, seo_description, views_count, published_at, created_at, updated_at)
    VALUES (4, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute([
        'Reverse Parallel Parking: Step-by-Step Guide for RMS Practical Exam',
        'reverse-parallel-parking-step-by-step-guide-nsw',
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800',
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800',
        'Yongoy Editorial',
        'Yongoy Editorial',
        'Driving Tips',
        'Master the 1-2-1 steering method, reference points, and blind spot observation for flawless reverse parallel parking.',
        'Master the 1-2-1 steering method, reference points, and blind spot observation for flawless reverse parallel parking.',
        'Reverse parallel parking is one of the most dreaded manoeuvres on the NSW driving test, but with the right reference points it becomes predictable...',
        'Reverse parallel parking is one of the most dreaded manoeuvres on the NSW driving test, but with the right reference points it becomes predictable...',
        'published',
        'Reverse Parallel Parking: Step-by-Step Guide for RMS Practical Exam | EZY 2 LEARN',
        'Master the 1-2-1 steering method, reference points, and blind spot observation for flawless reverse parallel parking.',
        890,
        '2026-10-16 11:00:00'
    ]);
}

$check5 = $db->query("SELECT id FROM blogs WHERE id = 5")->fetch();
if (!$check5) {
    $stmt = $db->prepare("INSERT INTO blogs (id, title, slug, featured_image, image_url, author_name, publisher_name, category, summary, description, content, body, status, seo_title, seo_description, views_count, published_at, created_at, updated_at)
    VALUES (5, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute([
        'Hazard Perception Test (HPT) NSW: Expert Practice Tips & Guide',
        'hazard-perception-test-hpt-nsw-practice-guide',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
        'Yongoy Editorial',
        'Yongoy Editorial',
        'Test Preparation',
        'Everything you need to pass the touchscreen Hazard Perception Test before booking your P1 driving test.',
        'Everything you need to pass the touchscreen Hazard Perception Test before booking your P1 driving test.',
        'The Hazard Perception Test (HPT) measures your ability to recognise and react safely to traffic hazards. In NSW, you must pass this computer-based test...',
        'The Hazard Perception Test (HPT) measures your ability to recognise and react safely to traffic hazards. In NSW, you must pass this computer-based test...',
        'published',
        'Hazard Perception Test (HPT) NSW: Expert Practice Tips & Guide | EZY 2 LEARN',
        'Everything you need to pass the touchscreen Hazard Perception Test before booking your P1 driving test.',
        1120,
        '2026-10-16 09:30:00'
    ]);
}

echo "Blogs populated successfully." . PHP_EOL;
