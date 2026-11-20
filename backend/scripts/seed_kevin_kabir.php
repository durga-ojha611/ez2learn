<?php
require_once dirname(__DIR__) . '/config/database.php';

$db = Database::getConnection();

$name = "Kevin Kabir";
$title = "TFNSW Accredited Professional Driving Instructor";
$bio = "After discovering a passion for teaching while helping my family and friends, I decided to pursue a career as a professional driving instructor. Since then, I’ve built over a decade of experience helping learners become safe, confident, and capable drivers.

One of my greatest strengths as an instructor is creating a calm, relaxed, and stress-free learning environment. I understand that every student learns differently, which is why I tailor each lesson to the individual’s needs, confidence level, and goals. By teaching at the right pace and focusing on areas that require extra attention or challenge, I help students develop strong driving skills and confidence behind the wheel.

My extensive knowledge of Sydney’s diverse road conditions — from busy city streets to suburban roads — ensures students gain practical experience in a wide range of driving environments. This personalised approach and commitment to quality instruction have helped make EZY 2 LEARN Driving School one of Sydney’s most trusted & Award-winning driving schools.

Outside of instructing, I enjoy spending quality time with my family, including my four children — two of whom I’ve proudly taught to drive myself.

I offer automatic driving lessons: Automatic lessons available in my vehicle or yours.";

$qualifications = json_encode([
    "RMS accredited Licensed Driving Instructor",
    "Trainer and Assessor for New Driving Instructors",
    "Certificate IV in Driving Instruction",
    "Certificate IV in Training & Assessment",
    "Keys2Drive Accredited Instructor",
    "Safer Drivers Course Facilitator",
    "Safer Driver Course Coach",
    "Advanced Diploma of Leadership and Management, with excellent customer service skills",
    "Frontline Management Certified",
    "Special capability to teach nervous and anxious learners"
], JSON_UNESCAPED_SLASHES);

$stmt = $db->prepare("
    UPDATE instructors SET
        name = ?,
        bio = ?,
        qualifications = ?,
        accreditation_number = 'TFNSW-INS-2026-KK',
        experience_years = 12,
        hourly_rate = 75.00,
        transmission = 'automatic',
        service_areas = 'Parramatta, Westmead, Blacktown, Castle Hill, Sydney CBD, Silverwater',
        vehicle_make = 'Toyota',
        vehicle_model = 'Corolla Hybrid Dual-Control',
        vehicle_year = 2024,
        is_dual_control = 1,
        ancap_safety_rating = 5,
        rating = 4.95,
        total_reviews = 148,
        active_learners = 32,
        total_lessons = 3450,
        status = 'active'
    WHERE id = 1
");

$stmt->execute([$name, $bio, $qualifications]);

echo "Instructor Kevin Kabir successfully updated in MySQL!\n";
