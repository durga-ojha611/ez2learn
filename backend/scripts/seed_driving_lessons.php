<?php
// Seed the 14 driving lessons from user reference image into MySQL database

$host = '127.0.0.1';
$db   = 'ezy2learn_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    echo "Connected to MySQL successfully.\n";

    // Truncate and replace or upsert services
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE services; SET FOREIGN_KEY_CHECKS = 1;");

    $lessons = [
        [
            'id' => 1,
            'name' => 'First Introductory Lesson Auto (New Learners Only)',
            'subtitle' => 'Special discounted first lesson for new beginners',
            'slug' => 'first-introductory-lesson-auto',
            'category' => 'Beginner',
            'transmission' => 'automatic',
            'duration_minutes' => 60,
            'price_aud' => 65.00,
            'description' => 'Comprehensive intro lesson for absolute beginners. Includes skills evaluation, vehicle controls briefing, calm first drive, and NSW logbook setup.',
            'image_url' => 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                '1-on-1 Patient RMS Instructor',
                'Dual-Control Modern ANCAP Fleet',
                'Skills Assessment & Roadmap',
                '3 NSW Logbook Hours Credited'
            ]),
            'is_featured' => 1,
            'is_active' => 1,
            'sort_order' => 1
        ],
        [
            'id' => 2,
            'name' => 'Auto Lesson [Mon-Fri]',
            'subtitle' => 'Standard weekday automatic driving lesson',
            'slug' => 'auto-lesson-mon-fri',
            'category' => 'Beginner',
            'transmission' => 'automatic',
            'duration_minutes' => 60,
            'price_aud' => 70.00,
            'description' => 'Tailored weekday training covering essential road skills, lane discipline, roundabouts, traffic navigation, and logbook hours completion.',
            'image_url' => 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'Free Door-to-Door Pickup',
                'Roundabouts & Intersection Practice',
                'Dual-Control Automatic Sedan',
                'Flexible Morning & Evening Times'
            ]),
            'is_featured' => 1,
            'is_active' => 1,
            'sort_order' => 2
        ],
        [
            'id' => 3,
            'name' => 'Prepare for Driving Test [Auto]',
            'subtitle' => 'Realistic mock exam on actual Service NSW testing routes',
            'slug' => 'prepare-for-driving-test-auto',
            'category' => 'Test Prep',
            'transmission' => 'automatic',
            'duration_minutes' => 90,
            'price_aud' => 110.00,
            'description' => 'Full dress rehearsal for your practical driving test. Evaluated against official RMS criteria with immediate remediation of fail items.',
            'image_url' => 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'Official Sydney RMS Test Routes',
                'Full Mock Test Scoring Sheet',
                'Kerbside & Hill Start Drills',
                'Confidence & Stress Management'
            ]),
            'is_featured' => 1,
            'is_active' => 1,
            'sort_order' => 3
        ],
        [
            'id' => 4,
            'name' => 'Driving Test Car Hire (Auto)',
            'subtitle' => '45-min pre-test warm-up + dual-control car hire at RMS',
            'slug' => 'driving-test-car-hire-auto',
            'category' => 'Test Prep',
            'transmission' => 'automatic',
            'duration_minutes' => 150,
            'price_aud' => 190.00,
            'description' => 'Stress-free test day support. We pick you up, do a 45-minute warm-up drive to calm nerves, accompany you to the testing centre, and provide the certified vehicle.',
            'image_url' => 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                '45-Min Pre-Test Route Warm-Up',
                'RMS Compliant Dual-Control Car',
                'Instructor Accompaniment at Centre',
                'Return Home Drop-Off Included'
            ]),
            'is_featured' => 1,
            'is_active' => 1,
            'sort_order' => 4
        ],
        [
            'id' => 5,
            'name' => 'Parking Lesson Practice',
            'subtitle' => 'Reverse parallel, 90-degree bay, and angle parking mastery',
            'slug' => 'parking-lesson-practice',
            'category' => 'Specialized',
            'transmission' => 'both',
            'duration_minutes' => 60,
            'price_aud' => 75.00,
            'description' => 'Take the anxiety out of parking! Master simple reference points for reverse parallel parking, shopping centre bays, kerb distance, and tight spaces.',
            'image_url' => 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'Reverse Parallel Formula',
                'Bay & Shopping Centre Parking',
                'Mirror & Blind-Spot Techniques',
                'Repetition Practice in Real Lots'
            ]),
            'is_featured' => 0,
            'is_active' => 1,
            'sort_order' => 5
        ],
        [
            'id' => 6,
            'name' => 'Weekend Lesson Auto [Saturday-Sunday]',
            'subtitle' => 'Flexible Saturday & Sunday training for busy learners',
            'slug' => 'weekend-lesson-auto',
            'category' => 'Weekend',
            'transmission' => 'automatic',
            'duration_minutes' => 60,
            'price_aud' => 75.00,
            'description' => 'Weekend driving lessons fitted around your school, university, or work schedule. Experience realistic weekend traffic conditions safely.',
            'image_url' => 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'Available Saturday & Sunday',
                'Weekend Traffic Navigation',
                'Door-to-Door Service',
                'Same 3-for-1 Logbook Credit'
            ]),
            'is_featured' => 1,
            'is_active' => 1,
            'sort_order' => 6
        ],
        [
            'id' => 7,
            'name' => 'Refresher & Overseas Conversions Lesson',
            'subtitle' => 'Polish your skills or transition safely to NSW road rules',
            'slug' => 'refresher-overseas-conversions-lesson',
            'category' => 'Conversions',
            'transmission' => 'both',
            'duration_minutes' => 90,
            'price_aud' => 110.00,
            'description' => 'Ideal for drivers returning to the road after a hiatus or holders of overseas licences looking to gain familiarity with Sydney driving and road signs.',
            'image_url' => 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'Australian Road Rules Audit',
                'Roundabouts & Speed Limits',
                'Confidence Rebuilding Exercises',
                'Right-hand Drive Familiarisation'
            ]),
            'is_featured' => 0,
            'is_active' => 1,
            'sort_order' => 7
        ],
        [
            'id' => 8,
            'name' => 'CBD & Freeway Driving Lesson',
            'subtitle' => 'High-speed motorways, lane merging, and dense city traffic',
            'slug' => 'cbd-freeway-driving-lesson',
            'category' => 'Specialized',
            'transmission' => 'both',
            'duration_minutes' => 90,
            'price_aud' => 115.00,
            'description' => 'Overcome highway fear with experienced instructors. Practice on M2, M4, M7, lane positioning at 100km/h, and navigating multi-lane CBD one-way streets.',
            'image_url' => 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'Motorway On & Off Ramps',
                '100km/h Merging & Safe Gaps',
                'Sydney CBD One-Way Grid Practice',
                'Tunnel & Heavy Traffic Mastery'
            ]),
            'is_featured' => 0,
            'is_active' => 1,
            'sort_order' => 8
        ],
        [
            'id' => 9,
            'name' => 'NDIS Self-Managed Funding',
            'subtitle' => 'Patient, supportive lessons for self-managed NDIS participants',
            'slug' => 'ndis-self-managed-funding',
            'category' => 'NDIS',
            'transmission' => 'automatic',
            'duration_minutes' => 60,
            'price_aud' => 85.00,
            'description' => 'Dedicated driving instruction for self-managed and plan-managed NDIS clients. We provide official itemized invoices for easy NDIS plan reimbursement.',
            'image_url' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'NDIS Tax Invoices Provided',
                'Tailored Pace & Sensory Comfort',
                'Anxiety Reduction Techniques',
                'Dual-Control Certified Safety'
            ]),
            'is_featured' => 1,
            'is_active' => 1,
            'sort_order' => 9
        ],
        [
            'id' => 10,
            'name' => 'Overseas Licence Conversion',
            'subtitle' => 'Direct fast-track preparation to gain your NSW unrestricted licence',
            'slug' => 'overseas-licence-conversion',
            'category' => 'Conversions',
            'transmission' => 'both',
            'duration_minutes' => 60,
            'price_aud' => 75.00,
            'description' => 'Specifically tailored for migrants and visa holders wanting to convert an international licence. Learn key differences in NSW driving laws and pass on attempt 1.',
            'image_url' => 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'NSW Specific Road Rules',
                'Elimination of Common Habits',
                'Give-Way & Right-of-Way Rules',
                'Service NSW Booking Advice'
            ]),
            'is_featured' => 0,
            'is_active' => 1,
            'sort_order' => 10
        ],
        [
            'id' => 11,
            'name' => 'Driving Test Preparation',
            'subtitle' => 'Intensive final skill polish before your driving test',
            'slug' => 'driving-test-preparation',
            'category' => 'Test Prep',
            'transmission' => 'both',
            'duration_minutes' => 60,
            'price_aud' => 75.00,
            'description' => 'Targeted 60-minute tune-up focusing on your weakest manoeuvres, observation habits (head checks), speed consistency, and test question reviews.',
            'image_url' => 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'Pre-Test Diagnostic Review',
                'Head-Check & Blind Spot Drills',
                'Instant Performance Feedback',
                'Test Day Psychology & Tips'
            ]),
            'is_featured' => 0,
            'is_active' => 1,
            'sort_order' => 11
        ],
        [
            'id' => 12,
            'name' => 'Digital Gift Card',
            'subtitle' => 'The perfect gift of driving independence for friends & family',
            'slug' => 'digital-gift-card',
            'category' => 'Vouchers',
            'transmission' => 'both',
            'duration_minutes' => 60,
            'price_aud' => 70.00,
            'description' => 'Give the gift of safe driving! Digital gift cards delivered straight via email with a custom message. Redeemable on any lesson or package with 3-year validity.',
            'image_url' => 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'Instant Email Voucher Delivery',
                'Valid Across Greater Sydney',
                'Redeemable for Any Service',
                '3 Years Expiry Window'
            ]),
            'is_featured' => 0,
            'is_active' => 1,
            'sort_order' => 12
        ],
        [
            'id' => 13,
            'name' => 'Night Driving',
            'subtitle' => 'Complete your NSW mandatory 20 night logbook hours safely',
            'slug' => 'night-driving',
            'category' => 'Specialized',
            'transmission' => 'both',
            'duration_minutes' => 60,
            'price_aud' => 80.00,
            'description' => 'NSW learner drivers must log at least 20 night hours. Learn how to drive safely in the dark, manage glare, judge distances with headlights, and detect hazards.',
            'image_url' => 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'Satisfies 20 Night Hours Rule',
                'Glare & High-Beam Management',
                'Night Pedestrian Hazard Detection',
                'Dual-Control Night Safety'
            ]),
            'is_featured' => 0,
            'is_active' => 1,
            'sort_order' => 13
        ],
        [
            'id' => 14,
            'name' => 'First Go Guaranteed',
            'subtitle' => 'Pass on your first attempt or free test day car hire!',
            'slug' => 'first-go-guaranteed',
            'category' => 'Guarantee',
            'transmission' => 'automatic',
            'duration_minutes' => 600,
            'price_aud' => 590.00,
            'description' => 'Our flagship first-time pass guarantee package. Includes complete structured training, 2 mock tests, and test day car hire. If you fail, we cover your re-test car hire for free!',
            'image_url' => 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=600&auto=format&fit=crop&q=80',
            'included_features' => json_encode([
                'Complete Structured Lessons',
                '2 Full Route Mock Tests',
                'Test Day Car Hire Included',
                'Free Re-Test Hire if Not Passed'
            ]),
            'is_featured' => 1,
            'is_active' => 1,
            'sort_order' => 14
        ]
    ];

    $stmt = $pdo->prepare("
        INSERT INTO services (
            id, name, subtitle, slug, category, transmission,
            duration_minutes, price_aud, description, image_url,
            included_features, is_featured, is_active, sort_order, created_at, updated_at
        ) VALUES (
            :id, :name, :subtitle, :slug, :category, :transmission,
            :duration_minutes, :price_aud, :description, :image_url,
            :included_features, :is_featured, :is_active, :sort_order, NOW(), NOW()
        )
    ");

    foreach ($lessons as $lesson) {
        $stmt->execute($lesson);
        echo "✓ Seeded lesson {$lesson['id']}: {$lesson['name']}\n";
    }

    echo "\nAll 14 driving lessons successfully seeded into database!\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
