<?php
require_once dirname(__DIR__) . '/config/database.php';

$db = Database::getConnection();

$db->exec("
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NULL,
    description TEXT NOT NULL,
    body LONGTEXT NOT NULL,
    publisher_name VARCHAR(150) NOT NULL,
    seo_title VARCHAR(255) NULL,
    seo_description TEXT NULL,
    status ENUM('published', 'draft') DEFAULT 'published',
    views_count INT DEFAULT 0,
    published_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (status),
    INDEX (category),
    INDEX (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

echo "Table blogs created or already exists.\n";

// Check if records exist
$count = (int)$db->query("SELECT COUNT(*) FROM blogs")->fetchColumn();
if ($count === 0) {
    $seedBlogs = [
        [
            'title' => 'Top 10 Tips for Passing Your NSW Driving Test on the First Attempt',
            'slug' => 'top-10-tips-passing-nsw-driving-test',
            'category' => 'Test Preparation',
            'image_url' => 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=80',
            'description' => 'Essential strategies and checklist to ace the practical driving assessment across Western Sydney test centres.',
            'body' => "Taking your practical driving test in NSW can feel overwhelming, but proper preparation makes all the difference.\n\n### 1. Master Parallel and Kerb-side Parking\nExaminers consistently look for observation checks and indicator usage before reversing.\n\n### 2. Check Mirrors Every 8-10 Seconds\nFrequent head checks and blind-spot checks during lane transitions are crucial score sheet items.\n\n### 3. Obey School Zones and Speed Limits strictly\nEven 2 km/h over the limit in an active 40km/h school zone leads to an immediate test termination.",
            'publisher_name' => 'Daniel Okafor',
            'seo_title' => 'Pass NSW Driving Test First Time - 10 Essential Tips | EZY 2 LEARN',
            'seo_description' => 'Learn how to pass your NSW practical driving test on the first attempt with advice from certified senior instructors in Sydney.',
            'status' => 'published',
            'views_count' => 420,
            'published_at' => '2026-11-10 10:00:00'
        ],
        [
            'title' => 'Manual vs Automatic: Which Licence Should You Choose in Sydney?',
            'slug' => 'manual-vs-automatic-licence-sydney',
            'category' => 'Licence Guides',
            'image_url' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
            'description' => 'A comprehensive comparison between manual and automatic transmission training to guide new learner drivers.',
            'body' => "Choosing between an automatic and manual driving licence is one of the first major decisions when starting driving lessons in Australia.\n\n### The Automatic Advantage\n- Easier to master in heavy Sydney traffic\n- Faster completion of logbook hours with less cognitive load\n- Modern electric and hybrid vehicles are all automatic\n\n### The Manual Advantage\n- Full unrestricted vehicle control\n- Career benefits for trade vehicles and commercial fleets",
            'publisher_name' => 'Priya Nair',
            'seo_title' => 'Manual vs Automatic Driving Licence Sydney | EZY 2 LEARN Guide',
            'seo_description' => 'Compare manual and automatic driving lessons in Sydney. Understand NSW licensing rules, costs, and career flexibility.',
            'status' => 'published',
            'views_count' => 315,
            'published_at' => '2026-11-12 14:30:00'
        ],
        [
            'title' => 'Understanding Logbook Hours: How the 3-for-1 Scheme Works',
            'slug' => 'understanding-logbook-hours-3-for-1-scheme',
            'category' => 'Road Safety',
            'image_url' => 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80',
            'description' => 'Triple your logbook hours with qualified RMS instructors under the Transport for NSW structured lesson framework.',
            'body' => "Transport for NSW allows learners to record 3 logbook hours for every 1 hour of professional driving instruction, up to a maximum of 10 structured hours (totalling 30 logbook hours).\n\n### Key Regulations\n- Lessons must be delivered by a licensed driving instructor holding a current certificate.\n- The instructor signs off on specific competency elements in your official logbook app.",
            'publisher_name' => 'Sofia Reyes',
            'seo_title' => 'NSW 3-for-1 Logbook Hours Explained | EZY 2 LEARN Driving School',
            'seo_description' => 'How to earn 30 logbook hours with 10 structured lessons in Sydney. Complete guide to Transport for NSW 3-for-1 scheme.',
            'status' => 'published',
            'views_count' => 580,
            'published_at' => '2026-11-14 09:15:00'
        ],
        [
            'title' => 'Navigating Roundabouts and Multi-Lane Intersections Safely',
            'slug' => 'navigating-roundabouts-multi-lane-intersections',
            'category' => 'Driving Tips',
            'image_url' => 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
            'description' => 'Mastering lane positioning, right of way rules, and signalling protocols on complex Australian roundabouts.',
            'body' => "Roundabouts are designed to maintain fluid traffic, but multi-lane roundabouts often confuse novice drivers.\n\n### Golden Rules for Roundabouts\n1. Always give way to vehicles already in the roundabout to your right.\n2. Signal left when taking the first exit; signal right when turning right; do not signal until past the penultimate exit when continuing straight.",
            'publisher_name' => 'Marcus Bell',
            'seo_title' => 'NSW Roundabout Rules & Lane Positioning | Driving Lessons Sydney',
            'seo_description' => 'Step-by-step guide to Australian roundabout laws, indicator rules, and defensive driving techniques for learner drivers.',
            'status' => 'draft',
            'views_count' => 95,
            'published_at' => '2026-11-16 16:00:00'
        ]
    ];

    $stmt = $db->prepare("
        INSERT INTO blogs (title, slug, category, image_url, description, body, publisher_name, seo_title, seo_description, status, views_count, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($seedBlogs as $b) {
        $stmt->execute([
            $b['title'],
            $b['slug'],
            $b['category'],
            $b['image_url'],
            $b['description'],
            $b['body'],
            $b['publisher_name'],
            $b['seo_title'],
            $b['seo_description'],
            $b['status'],
            $b['views_count'],
            $b['published_at']
        ]);
    }
    echo "Seeded " . count($seedBlogs) . " blog articles.\n";
} else {
    echo "Blogs table already has {$count} articles.\n";
}
