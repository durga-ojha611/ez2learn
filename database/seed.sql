-- EZY 2 LEARN Driving School - Complete Seed Data
USE ezy2learn_db;

-- 1. Roles
INSERT INTO roles (id, name, display_name, description) VALUES
(1, 'super_admin', 'Super Administrator', 'Full access to all modules and system configurations'),
(2, 'booking_manager', 'Booking Manager', 'Manages bookings, schedules, students, and matching'),
(3, 'instructor_coordinator', 'Instructor Coordinator', 'Manages instructors, service areas, availability, and verifications'),
(4, 'content_editor', 'Content Editor', 'Manages website content, blogs, FAQs, gallery, and reviews'),
(5, 'finance_viewer', 'Finance Viewer', 'Read-only access to transactions, revenue reports, and financial statistics');

-- 2. Permissions
INSERT INTO permissions (id, module, action, code, description) VALUES
(1, 'dashboard', 'view', 'dashboard.view', 'View dashboard overview and metrics'),
(2, 'bookings', 'view', 'bookings.view', 'View booking list and details'),
(3, 'bookings', 'create', 'bookings.create', 'Create new driving lesson bookings'),
(4, 'bookings', 'edit', 'bookings.edit', 'Edit and update bookings'),
(5, 'bookings', 'status', 'bookings.status', 'Change booking status'),
(6, 'bookings', 'assign', 'bookings.assign', 'Assign or change instructors'),
(7, 'instructors', 'view', 'instructors.view', 'View instructor profiles and documents'),
(8, 'instructors', 'manage', 'instructors.manage', 'Create, edit, and approve instructors'),
(9, 'students', 'view', 'students.view', 'View student profiles and logbooks'),
(10, 'students', 'manage', 'students.manage', 'Create and edit student accounts'),
(11, 'matching', 'use', 'matching.use', 'Use instructor matching system'),
(12, 'calendar', 'manage', 'calendar.manage', 'Manage lesson schedules and calendar'),
(13, 'services', 'manage', 'services.manage', 'Manage services and packages'),
(14, 'payments', 'view', 'payments.view', 'View payments and transactions'),
(15, 'payments', 'refund', 'payments.refund', 'Process refunds and record offline payments'),
(16, 'locations', 'manage', 'locations.manage', 'Manage service areas and suburbs'),
(17, 'reviews', 'moderate', 'reviews.moderate', 'Approve, reject, or feature reviews'),
(18, 'website', 'edit', 'website.edit', 'Edit website content, blogs, FAQs, and gallery'),
(19, 'reports', 'view', 'reports.view', 'View reports and export data'),
(20, 'settings', 'manage', 'settings.manage', 'Manage business settings and admin users');

-- 3. Role Permissions (Super Admin gets all)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Booking Manager
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 9), (2, 10), (2, 11), (2, 12), (2, 14);

-- Instructor Coordinator
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 2), (3, 6), (3, 7), (3, 8), (3, 11), (3, 12), (3, 16);

-- Content Editor
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 1), (4, 17), (4, 18);

-- Finance Viewer
INSERT INTO role_permissions (role_id, permission_id) VALUES
(5, 1), (5, 2), (5, 14), (5, 19);

-- 4. Admin Users (Password for all demo accounts is: password123)
INSERT INTO admin_users (id, role_id, name, email, password_hash, avatar_url, phone, status) VALUES
(1, 1, 'David Miller', 'admin@ezy2learn.com.au', '$2y$10$eIhrGdEDJQhKttY6JzNVBO6tQBwiJD/AgsS0fu17FMLyGfNqAtcte', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '+61 412 345 678', 'active'),
(2, 2, 'Sarah Jenkins', 'bookings@ezy2learn.com.au', '$2y$10$eIhrGdEDJQhKttY6JzNVBO6tQBwiJD/AgsS0fu17FMLyGfNqAtcte', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '+61 423 456 789', 'active'),
(3, 3, 'Marcus Wong', 'instructors@ezy2learn.com.au', '$2y$10$eIhrGdEDJQhKttY6JzNVBO6tQBwiJD/AgsS0fu17FMLyGfNqAtcte', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '+61 434 567 890', 'active'),
(4, 5, 'Elena Rostova', 'finance@ezy2learn.com.au', '$2y$10$eIhrGdEDJQhKttY6JzNVBO6tQBwiJD/AgsS0fu17FMLyGfNqAtcte', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '+61 445 678 901', 'active');

-- 5. States
INSERT INTO states (id, code, name, country) VALUES
(1, 'NSW', 'New South Wales', 'Australia');

-- 6. Cities
INSERT INTO cities (id, state_id, name) VALUES
(1, 1, 'Greater Sydney');

-- 7. Suburbs (Greater Sydney coverage required by Section 9)
INSERT INTO suburbs (id, city_id, name, postcode, region, is_active) VALUES
-- Western Sydney
(1, 1, 'Parramatta', '2150', 'Western Sydney', 1),
(2, 1, 'Blacktown', '2148', 'Western Sydney', 1),
(3, 1, 'Penrith', '2750', 'Western Sydney', 1),
(4, 1, 'Auburn', '2144', 'Western Sydney', 1),
(5, 1, 'Castle Hill', '2154', 'Western Sydney', 1),
-- Inner West & City
(6, 1, 'Strathfield', '2135', 'Inner West & City', 1),
(7, 1, 'Burwood', '2134', 'Inner West & City', 1),
(8, 1, 'Sydney CBD', '2000', 'Inner West & City', 1),
-- North Shore & Ryde
(9, 1, 'Ryde', '2112', 'North Shore & Ryde', 1),
(10, 1, 'Macquarie Park', '2113', 'North Shore & Ryde', 1),
(11, 1, 'Chatswood', '2067', 'North Shore & Ryde', 1),
-- South-West
(12, 1, 'Liverpool', '2170', 'South-West', 1),
(13, 1, 'Bankstown', '2200', 'South-West', 1),
(14, 1, 'Campbelltown', '2560', 'South-West', 1);

-- 8. Instructors
INSERT INTO instructors (id, name, email, phone, avatar_url, accreditation_number, experience_years, hourly_rate, transmission, gender, bio, teaching_approach, qualifications, address, vehicle_make, vehicle_model, vehicle_year, vehicle_rego, is_dual_control, ancap_safety_rating, status, rating, total_reviews, working_days, working_hours_start, working_hours_end) VALUES
(1, 'Kevin O’Connor', 'kevin.oconnor@ezy2learn.com.au', '+61 411 223 344', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'DIA-NSW-88912', 12, 80.00, 'both', 'male', 'Senior RMS certified driving instructor with over 12 years of experience guiding nervous learners to first-time test passes.', 'Calm, patient, structured step-by-step guidance tailored to each student’s confidence levels.', 'Certificate IV in Driving Instruction (TLI41221), RMS Assessor, Safer Drivers Course Facilitator', '42 Church Street, Parramatta NSW 2150', 'Toyota', 'Corolla Hybrid', 2023, 'EZY-01A', 1, 5, 'active', 4.95, 148, '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]', '07:00:00', '18:00:00'),

(2, 'Aisha Khan', 'aisha.khan@ezy2learn.com.au', '+61 422 334 455', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'DIA-NSW-99234', 8, 85.00, 'automatic', 'female', 'Specialist in teaching young female learners and nervous drivers in Western Sydney and Hills District.', 'Positive reinforcement, hazard perception mastery, and stress-free parking techniques.', 'Cert IV in Transport & Logistics, Keys2drive Accredited, First Aid Certified', '15 Terminus Street, Castle Hill NSW 2154', 'Hyundai', 'i30 Active', 2024, 'EZY-02K', 1, 5, 'active', 4.98, 112, '["Monday","Wednesday","Thursday","Friday","Saturday","Sunday"]', '08:00:00', '19:00:00'),

(3, 'Michael Zhang', 'michael.zhang@ezy2learn.com.au', '+61 433 445 566', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'DIA-NSW-77401', 15, 90.00, 'manual', 'male', 'Expert manual transmission coach and RMS test route specialist for Macquarie Park, Chatswood, and Ryde testing centres.', 'Precision clutch control, defensive road craft, and complete mock RMS test audits.', 'Cert IV Driving Instruction, Master Driving Coach, Advanced Defensive Driving Instructor', '88 Waterloo Road, Macquarie Park NSW 2113', 'Mazda', 'Mazda 3 G20', 2022, 'EZY-03M', 1, 5, 'active', 4.91, 165, '["Tuesday","Wednesday","Thursday","Friday","Saturday"]', '07:30:00', '17:30:00'),

(4, 'Priya Sharma', 'priya.sharma@ezy2learn.com.au', '+61 444 556 677', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'DIA-NSW-66129', 6, 75.00, 'automatic', 'female', 'Bilingual instructor fluent in English, Hindi, and Punjabi, helping overseas licence holders convert smoothly to NSW full licences.', 'Clear communication, Australian road rules mastery, and roundabouts/merging confidence.', 'Cert IV in Driving Instruction, Working With Children Check (WWCC)', '22 George Street, Liverpool NSW 2170', 'Kia', 'Cerato Sport', 2023, 'EZY-04P', 1, 5, 'active', 4.88, 84, '["Monday","Tuesday","Wednesday","Thursday","Friday"]', '08:00:00', '18:00:00'),

(5, 'Daniel Cooper', 'daniel.cooper@ezy2learn.com.au', '+61 455 667 788', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'DIA-NSW-55823', 9, 85.00, 'both', 'male', 'Passionate instructor with a background in vehicle safety engineering, serving Blacktown and Penrith testing centres.', 'Analytical approach, spatial awareness training, and comprehensive logbook progression.', 'Cert IV Driving Instruction, Member of Australian Driver Trainers Association (ADTA)', '10 High Street, Penrith NSW 2750', 'Volkswagen', 'Golf Life', 2023, 'EZY-05D', 1, 5, 'active', 4.93, 96, '["Monday","Tuesday","Wednesday","Friday","Saturday"]', '07:00:00', '18:00:00');

-- 9. Instructor Service Areas
INSERT INTO instructor_service_areas (instructor_id, suburb_id) VALUES
-- Kevin (Parramatta, Auburn, Blacktown, Strathfield, Burwood)
(1, 1), (1, 4), (1, 2), (1, 6), (1, 7),
-- Aisha (Castle Hill, Parramatta, Ryde, Macquarie Park)
(2, 5), (2, 1), (2, 9), (2, 10),
-- Michael (Macquarie Park, Ryde, Chatswood, Sydney CBD)
(3, 10), (3, 9), (3, 11), (3, 8),
-- Priya (Liverpool, Campbelltown, Bankstown, Parramatta)
(4, 12), (4, 14), (4, 13), (4, 1),
-- Daniel (Penrith, Blacktown, Castle Hill)
(5, 3), (5, 2), (5, 5);

-- 10. Instructor Documents
INSERT INTO instructor_documents (instructor_id, document_type, title, file_path, expiry_date, verification_status, notes) VALUES
(1, 'driving_instructor_licence', 'NSW Driving Instructor Licence', '/uploads/docs/kevin_licence.pdf', '2028-06-30', 'verified', 'Renewed and fully compliant with Transport for NSW'),
(1, 'working_with_children_check', 'Working With Children Check (WWCC)', '/uploads/docs/kevin_wwcc.pdf', '2027-11-15', 'verified', 'WWC0847291E valid for paid work'),
(1, 'vehicle_insurance', 'Commercial Driving School Insurance', '/uploads/docs/kevin_insurance.pdf', '2027-03-31', 'verified', 'NRMA Comprehensive Commercial Policy'),
(2, 'driving_instructor_licence', 'NSW Driving Instructor Licence', '/uploads/docs/aisha_licence.pdf', '2027-09-20', 'verified', 'Transport for NSW verified'),
(2, 'dual_control_cert', 'Dual Control Engineering Certificate', '/uploads/docs/aisha_dual_control.pdf', '2028-12-31', 'verified', 'Certified installer RMS-approved pedals');

-- 11. Instructor Availability Slots
INSERT INTO instructor_availability (instructor_id, day_of_week, start_time, end_time, is_available) VALUES
(1, 1, '07:00:00', '18:00:00', 1),
(1, 2, '07:00:00', '18:00:00', 1),
(1, 3, '07:00:00', '18:00:00', 1),
(1, 4, '07:00:00', '18:00:00', 1),
(1, 5, '07:00:00', '18:00:00', 1),
(1, 6, '08:00:00', '15:00:00', 1),
(2, 1, '08:00:00', '19:00:00', 1),
(2, 3, '08:00:00', '19:00:00', 1),
(2, 4, '08:00:00', '19:00:00', 1),
(2, 5, '08:00:00', '19:00:00', 1),
(2, 6, '08:00:00', '17:00:00', 1),
(3, 2, '07:30:00', '17:30:00', 1),
(3, 3, '07:30:00', '17:30:00', 1),
(3, 4, '07:30:00', '17:30:00', 1),
(3, 5, '07:30:00', '17:30:00', 1),
(3, 6, '08:00:00', '14:00:00', 1);

-- 12. Students
INSERT INTO students (id, name, email, phone, avatar_url, address, suburb, postcode, licence_number, licence_stage, preferred_transmission, preferred_instructor_id, learning_objective, completed_lessons, recorded_instructor_hours, nsw_logbook_hours, total_spent, emergency_contact_name, emergency_contact_phone, status) VALUES
(1, 'Liam Walker', 'liam.walker@gmail.com', '+61 411 987 654', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', '14 Victoria Road', 'Parramatta', '2150', 'NSW-7392819', 'learner', 'automatic', 1, 'Pass NSW driving test on first attempt', 6, 6.0, 18.0, 480.00, 'Claire Walker (Mother)', '+61 411 111 222', 'active'),

(2, 'Chloe Nguyen', 'chloe.nguyen@outlook.com', '+61 422 876 543', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', '58 Showground Road', 'Castle Hill', '2154', 'NSW-8401928', 'learner', 'automatic', 2, 'Build night driving and reverse parking confidence', 8, 8.0, 24.0, 680.00, 'Minh Nguyen (Father)', '+61 422 222 333', 'active'),

(3, 'Oliver Smith', 'oliver.smith@yahoo.com.au', '+61 433 765 432', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '29 Talavera Road', 'Macquarie Park', '2113', 'NSW-9182736', 'learner', 'manual', 3, 'Master manual clutch control and hill starts', 4, 4.0, 12.0, 360.00, 'Jennifer Smith (Mother)', '+61 433 333 444', 'active'),

(4, 'Amira Al-Mansoor', 'amira.mansoor@gmail.com', '+61 444 654 321', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '12 Elizabeth Street', 'Liverpool', '2170', 'NSW-6281920', 'overseas_conversion', 'automatic', 4, 'Convert UAE licence to NSW Full Driver Licence', 3, 3.0, 3.0, 270.00, 'Tariq Al-Mansoor (Spouse)', '+61 444 444 555', 'active'),

(5, 'Ethan Davies', 'ethan.davies@hotmail.com', '+61 455 543 210', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '77 Castlereagh Street', 'Penrith', '2750', 'NSW-5544332', 'learner', 'automatic', 5, 'Complete 100 logbook hours and do mock test', 10, 10.0, 30.0, 750.00, 'Robert Davies (Father)', '+61 455 555 666', 'active'),

(6, 'Sophie Taylor', 'sophie.taylor@gmail.com', '+61 466 432 109', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', '101 Rawson Street', 'Auburn', '2144', 'NSW-4433221', 'learner', 'automatic', 1, 'Pass test at Silverwater RMS testing centre', 2, 2.0, 6.0, 160.00, 'Graham Taylor (Father)', '+61 466 666 777', 'active'),

(7, 'Noah Wilson', 'noah.wilson@gmail.com', '+61 477 321 098', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', '45 Albert Road', 'Strathfield', '2135', 'NSW-3322110', 'provisional_p1', 'both', 1, 'Refresher course for highway and rain driving', 1, 1.0, 1.0, 80.00, 'Emma Wilson (Mother)', '+61 477 777 888', 'graduated');

-- 13. Services
INSERT INTO services (id, name, slug, category, transmission, duration_minutes, price_aud, description, included_features, is_featured, is_active, sort_order) VALUES
(1, 'Automatic Driving Lesson', 'automatic-driving-lesson', 'standard', 'automatic', 60, 75.00, 'Comprehensive 1-hour automatic driving lesson in modern 5-star ANCAP dual-control vehicle.', '["1 Hour Professional Instruction", "NSW 3-for-1 Logbook Hours (counts as 3 hrs)", "Door-to-door pickup & dropoff", "Dual-control safety vehicle"]', 1, 1, 1),

(2, 'Manual Driving Lesson', 'manual-driving-lesson', 'standard', 'manual', 60, 85.00, 'Learn clutch biting points, smooth gear shifts, and hill starts with expert manual instructors.', '["1 Hour Manual Instruction", "Precision clutch & gearbox mastery", "Hill starts & stall recovery", "NSW 3-for-1 bonus hours"]', 1, 1, 2),

(3, 'Driving Test Preparation & Mock Test', 'driving-test-preparation', 'test_preparation', 'both', 120, 150.00, 'Realistic 2-hour mock test on actual RMS exam routes with detailed score assessment.', '["2-Hour intensive mock exam", "Actual Service NSW test routes", "Fail-item avoidance review", "Detailed score sheet report"]', 1, 1, 3),

(4, 'Test Day Car Hire Package', 'test-day-car-hire', 'car_hire', 'both', 150, 199.00, 'Warm-up lesson before test + dual-control car hire for the official RMS practical driving test.', '["45 min warm-up lesson before test", "Dual-control car hire for RMS exam", "Instructor accompaniment to testing centre", "Pick up & drop off included"]', 1, 1, 4),

(5, 'Refresher Driving Lesson', 'refresher-driving-lesson', 'refresher', 'both', 60, 80.00, 'Ideal for licensed drivers wanting to regain confidence, navigate Sydney motorways, or parallel park easily.', '["Tailored to specific fears", "Sydney motorway & tunnel driving", "Reverse parallel parking mastery", "Defensive driving updates"]', 0, 1, 5),

(6, 'Overseas Licence Conversion', 'overseas-licence-conversion', 'specialised', 'both', 90, 120.00, 'Targeted lesson for international licence holders converting to an Australian NSW Full Licence.', '["NSW road rules and signage", "Give way rules and roundabouts", "RMS conversion test guidance", "Mock conversion assessment"]', 0, 1, 6),

(7, 'NDIS Driving Lesson Support', 'ndis-driving-lessons', 'specialised', 'automatic', 60, 120.00, 'Accredited specialised lessons designed for participants under NDIS self-managed and plan-managed funding.', '["Patient, tailored pace", "NDIS line-item invoicing", "Modifications support assessment", "Progress reporting for coordinators"]', 0, 1, 7),

(8, 'Defensive Road Skills & Highway Driving', 'defensive-road-skills', 'standard', 'both', 90, 125.00, 'Advanced driving skills covering M4/M2/M7 motorways, wet weather control, and hazard mitigation.', '["High-speed merging mastery", "Wet weather emergency braking", "Blind spot management", "Following distance judgment"]', 0, 1, 8);

-- 14. Packages
INSERT INTO packages (id, name, slug, lesson_count, duration_per_lesson, price_aud, discount_amount, popular_badge, description, features, is_active) VALUES
(1, '5-Lesson Starter Package', '5-lesson-starter-package', 5, 60, 350.00, 25.00, 0, 'Great starting package for learners beginning their logbook journey. Counts as 15 logbook hours!', '["5 x 1-Hour Driving Lessons", "Counts as 15 NSW Logbook Hours", "Flexible booking schedule", "Free progress tracker app"]', 1),

(2, '10-Lesson Ultimate Logbook Boost', '10-lesson-ultimate-logbook-boost', 10, 60, 680.00, 70.00, 1, 'Maximise your NSW 3-for-1 benefit! 10 professional hours count as 30 official logbook hours.', '["10 x 1-Hour Driving Lessons", "Counts as 30 NSW Logbook Hours (Max 3-for-1 benefit)", "Free Mock Driving Test included", "Priority instructor booking", "Save $70 compared to single lessons"]', 1),

(3, 'Test Ready Bundle (Lesson + Car Hire)', 'test-ready-bundle', 2, 90, 290.00, 35.00, 0, 'The complete exam package: 90 min prep lesson plus dual control vehicle hire for the RMS exam.', '["90-minute pre-test practice", "Dual-control vehicle for RMS test", "Instructor support at testing centre", "Transport to & from test centre"]', 1),

(4, 'Complete Zero to P1 Freedom Pack', 'complete-zero-to-p1-freedom-pack', 20, 60, 1299.00, 201.00, 0, 'Comprehensive end-to-end program taking complete beginners all the way to passing the P1 test.', '["20 x 1-Hour Driving Lessons", "30 Logbook Bonus Hours unlocked", "Test Day Car Hire Included", "2 Mock Driving Tests Included", "100% Pass Guarantee Guarantee Support"]', 1);

-- 15. Package Services
INSERT INTO package_services (package_id, service_id, quantity) VALUES
(1, 1, 5),
(2, 1, 10),
(3, 4, 1), (3, 3, 1),
(4, 1, 20), (4, 4, 1);

-- 16. Bookings
INSERT INTO bookings (id, booking_code, student_id, instructor_id, service_id, package_id, transmission, lesson_date, start_time, end_time, duration_minutes, pickup_address, pickup_suburb, pickup_postcode, dropoff_address, special_notes, amount_aud, booking_status, payment_status, created_by_admin_id) VALUES
(1, 'EZB-2026-1001', 1, 1, 1, NULL, 'automatic', '2026-11-14', '09:00:00', '10:00:00', 60, '14 Victoria Road', 'Parramatta', '2150', '14 Victoria Road', 'Focus on 3-point turns and reverse parallel parking.', 75.00, 'confirmed', 'paid', 1),

(2, 'EZB-2026-1002', 2, 2, 1, NULL, 'automatic', '2026-11-14', '11:00:00', '12:00:00', 60, '58 Showground Road', 'Castle Hill', '2154', '58 Showground Road', 'Practicing roundabout navigation near Castle Towers.', 85.00, 'assigned', 'paid', 2),

(3, 'EZB-2026-1003', 3, 3, 2, NULL, 'manual', '2026-11-15', '10:00:00', '11:00:00', 60, '29 Talavera Road', 'Macquarie Park', '2113', '29 Talavera Road', 'Clutch control on steep inclines and smooth downshifting.', 90.00, 'confirmed', 'paid', 1),

(4, 'EZB-2026-1004', 4, 4, 6, NULL, 'automatic', '2026-11-15', '14:00:00', '15:30:00', 90, '12 Elizabeth Street', 'Liverpool', '2170', '12 Elizabeth Street', 'Overseas licence conversion test prep. Review Sydney school zones.', 120.00, 'confirmed', 'paid', 2),

(5, 'EZB-2026-1005', 5, 5, 3, NULL, 'automatic', '2026-11-16', '08:30:00', '10:30:00', 120, '77 Castlereagh Street', 'Penrith', '2750', 'Penrith Service NSW Centre', 'Mock test on official Penrith RMS testing routes.', 150.00, 'confirmed', 'paid', 1),

(6, 'EZB-2026-1006', 6, 1, 1, NULL, 'automatic', '2026-11-17', '15:00:00', '16:00:00', 60, '101 Rawson Street', 'Auburn', '2144', '101 Rawson Street', 'Beginner lesson. Introduction to dual controls and mirror setups.', 75.00, 'pending', 'pending', NULL),

(7, 'EZB-2026-1007', 1, 1, 4, NULL, 'automatic', '2026-11-18', '09:00:00', '11:30:00', 150, '14 Victoria Road', 'Parramatta', '2150', 'Silverwater Service NSW', 'Official practical driving test at Silverwater RMS centre.', 199.00, 'new_request', 'pending', NULL),

(8, 'EZB-2026-1008', 2, 2, 1, NULL, 'automatic', '2026-11-12', '14:00:00', '15:00:00', 60, '58 Showground Road', 'Castle Hill', '2154', '58 Showground Road', 'Completed lesson: Highway merging on M2 Motorway.', 85.00, 'completed', 'paid', 2),

(9, 'EZB-2026-1009', 3, 3, 2, NULL, 'manual', '2026-11-11', '13:00:00', '14:00:00', 60, '29 Talavera Road', 'Macquarie Park', '2113', '29 Talavera Road', 'Completed lesson: Complex intersections in Chatswood CBD.', 90.00, 'completed', 'paid', 1),

(10, 'EZB-2026-1010', 5, 5, 1, NULL, 'automatic', '2026-11-10', '10:00:00', '11:00:00', 60, '77 Castlereagh Street', 'Penrith', '2750', '77 Castlereagh Street', 'Completed lesson: Kerbside stops and angle parking.', 85.00, 'completed', 'paid', 1),

(11, 'EZB-2026-1011', 6, 1, 1, NULL, 'automatic', '2026-11-09', '11:00:00', '12:00:00', 60, '101 Rawson Street', 'Auburn', '2144', '101 Rawson Street', 'Student had flu. Rescheduled by mutual agreement.', 75.00, 'rescheduled', 'paid', 2),

(12, 'EZB-2026-1012', 4, 4, 1, NULL, 'automatic', '2026-11-08', '16:00:00', '17:00:00', 60, '12 Elizabeth Street', 'Liverpool', '2170', '12 Elizabeth Street', 'Student had emergency work commitment.', 75.00, 'cancelled', 'refunded', 1);

-- 17. Booking History
INSERT INTO booking_history (booking_id, admin_user_id, action, previous_status, new_status, comment) VALUES
(1, 1, 'created', NULL, 'pending', 'Booking created online by student Liam Walker'),
(1, 1, 'status_updated', 'pending', 'confirmed', 'Payment received via Stripe ($75.00). Instructor Kevin confirmed.'),
(2, 2, 'created', NULL, 'pending', 'Online booking for Castle Hill'),
(2, 2, 'assigned_instructor', 'pending', 'assigned', 'Assigned Aisha Khan based on service area coverage and automatic transmission'),
(8, 2, 'completed', 'confirmed', 'completed', 'Lesson completed successfully. 1 hr logged (3 logbook hrs).'),
(11, 2, 'rescheduled', 'confirmed', 'rescheduled', 'Rescheduled from 9 Nov to 17 Nov per student request due to medical reason'),
(12, 1, 'cancelled', 'confirmed', 'cancelled', 'Cancelled within policy window. Full refund issued to credit card.');

-- 18. Payments
INSERT INTO payments (id, transaction_id, booking_id, student_id, amount_aud, payment_method, payment_status, receipt_number, refund_amount, refund_reason, paid_at) VALUES
(1, 'TXN-2026-8801', 1, 1, 75.00, 'stripe', 'paid', 'RCP-10481', 0.00, NULL, '2026-11-12 14:22:00'),
(2, 'TXN-2026-8802', 2, 2, 85.00, 'credit_card', 'paid', 'RCP-10482', 0.00, NULL, '2026-11-12 16:05:00'),
(3, 'TXN-2026-8803', 3, 3, 90.00, 'credit_card', 'paid', 'RCP-10483', 0.00, NULL, '2026-11-13 09:15:00'),
(4, 'TXN-2026-8804', 4, 4, 120.00, 'bank_transfer', 'paid', 'RCP-10484', 0.00, NULL, '2026-11-13 10:40:00'),
(5, 'TXN-2026-8805', 5, 5, 150.00, 'stripe', 'paid', 'RCP-10485', 0.00, NULL, '2026-11-13 11:10:00'),
(6, 'TXN-2026-8806', 8, 2, 85.00, 'credit_card', 'paid', 'RCP-10479', 0.00, NULL, '2026-11-11 11:30:00'),
(7, 'TXN-2026-8807', 9, 3, 90.00, 'credit_card', 'paid', 'RCP-10480', 0.00, NULL, '2026-11-10 15:45:00'),
(8, 'TXN-2026-8808', 10, 5, 85.00, 'stripe', 'paid', 'RCP-10475', 0.00, NULL, '2026-11-09 09:00:00'),
(9, 'TXN-2026-8809', 11, 6, 75.00, 'credit_card', 'paid', 'RCP-10476', 0.00, NULL, '2026-11-08 13:20:00'),
(10, 'TXN-2026-8810', 12, 4, 75.00, 'credit_card', 'refunded', 'RCP-10470', 75.00, 'Cancelled with 48h notice due to work commitment', '2026-11-07 10:15:00');

-- 19. Reviews
INSERT INTO reviews (id, booking_id, student_id, instructor_id, student_name, rating, review_text, status, is_featured, submitted_at, approved_at) VALUES
(1, 8, 2, 2, 'Chloe Nguyen', 5, 'Aisha is the most amazing instructor! I was so anxious about merging onto the M2 motorway and reverse parking, but she made everything so calm and structured. Highly recommend EZY 2 LEARN!', 'approved', 1, '2026-11-12 17:00:00', '2026-11-12 18:00:00'),

(2, 9, 3, 3, 'Oliver Smith', 5, 'Michael taught me manual driving in just 4 lessons. His explanations of clutch friction point and gear changes eliminated all stalling. Passed my manual test first try at Chatswood!', 'approved', 1, '2026-11-11 16:30:00', '2026-11-11 17:00:00'),

(3, 10, 5, 5, 'Ethan Davies', 5, 'Daniel knows the Penrith RMS test routes inside and out. The mock test we did pinpointed three bad habits I had, which saved me from failing on test day.', 'approved', 1, '2026-11-10 14:15:00', '2026-11-10 15:00:00'),

(4, 1, 1, 1, 'Liam Walker', 5, 'Kevin is patient, super encouraging, and really explains the NSW road rules clearly. Unlocked 18 logbook hours in just 6 lessons thanks to the 3-for-1 scheme!', 'approved', 0, '2026-11-13 10:00:00', '2026-11-13 10:30:00'),

(5, 6, 6, 1, 'Sophie Taylor', 4, 'Great first lesson in Auburn. Kevin made me feel safe from minute one.', 'pending', 0, '2026-11-13 11:20:00', NULL);

-- 20. Notifications
INSERT INTO notifications (id, title, message, category, related_id, link_url, is_read, created_at) VALUES
(1, 'New Booking Request', 'Liam Walker requested a Test Day Car Hire package for 18 Nov at Silverwater RMS.', 'booking', 7, '/bookings/7', 0, '2026-11-13 11:15:00'),
(2, 'Payment Received ($150.00 AUD)', 'Ethan Davies paid $150.00 AUD for Mock Test Preparation via Stripe.', 'payment', 5, '/payments', 0, '2026-11-13 11:10:00'),
(3, 'New Student Registration', 'Sophie Taylor registered as a learner in Auburn (2144). Preferred auto.', 'student', 6, '/students/6', 0, '2026-11-13 10:45:00'),
(4, 'New Student Review Submitted', 'Sophie Taylor submitted a 4-star review for Kevin O’Connor waiting for moderation.', 'review', 5, '/reviews', 0, '2026-11-13 10:30:00'),
(5, 'Instructor Document Verifications', 'Kevin O’Connor updated his NRMA Commercial Insurance certificate.', 'instructor', 1, '/instructors/1', 1, '2026-11-12 16:00:00'),
(6, 'Lesson Completed & Logged', 'Aisha Khan logged completed lesson for Chloe Nguyen (1 hour recorded, 3 logbook hrs).', 'booking', 8, '/bookings/8', 1, '2026-11-12 15:30:00');

-- 21. FAQs
INSERT INTO faqs (id, category, question, answer, sort_order, is_published) VALUES
(1, 'Logbook & Hours', 'How does the NSW 3-for-1 structured lesson hours scheme work?', 'Under Transport for NSW rules, every 1 hour of professional driving lesson you complete with an RMS-accredited EZY 2 LEARN driving instructor counts as 3 hours in your Learner Logbook! You can record up to a maximum of 10 structured hours, which equals 30 logbook hours.', 1, 1),

(2, 'Booking & Pricing', 'Can I choose between Automatic and Manual transmission?', 'Yes! We have certified instructors and 5-star ANCAP safety dual-control vehicles for both Automatic and Manual transmissions across Greater Sydney. You can specify your preference when booking.', 2, 1),

(3, 'Test Day', 'Can I hire an instructor’s car for my RMS practical driving test?', 'Absolutely! Our Test Day Package includes a 45-minute warm-up lesson, use of the instructor’s dual-control vehicle for the test, and full accompaniment to and from the testing centre.', 3, 1),

(4, 'Cancellation Policy', 'What is your cancellation and rescheduling policy?', 'We require at least 24 hours notice for any lesson cancellation or rescheduling. Cancellations with over 24 hours notice receive a 100% refund or free reschedule credit.', 4, 1),

(5, 'Overseas Licence', 'Can you help me convert my overseas driving licence to NSW?', 'Yes, we specialise in Overseas Licence Conversions. Our instructors will familiarise you with Australian road rules, give way scenarios, roundabouts, and assess your test readiness.', 5, 1);

-- 22. Blogs
INSERT INTO blogs (id, title, slug, featured_image, author_name, category, summary, content, status, views_count, published_at) VALUES
(1, 'Top 10 Reasons Learners Fail the NSW Driving Test (And How to Avoid Them)', 'top-10-reasons-learners-fail-nsw-driving-test', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', 'Kevin O’Connor', 'Test Preparation', 'Discover the most common critical errors and fail items on the NSW RMS practical driving exam and how to ace them.', 'The NSW driving test is designed to measure your ability to make safe decisions independently. The top critical errors that cause immediate test termination include failing to stop completely at stop signs, improper observation during reverse parallel parking, speeding through school zones, and inappropriate gap selection at busy roundabouts...', 'published', 1420, '2026-10-15 09:00:00'),

(2, 'How to Maximise the NSW 3-for-1 Logbook Rule', 'how-to-maximise-nsw-3-for-1-logbook-rule', 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800', 'Aisha Khan', 'Learner Guides', 'Learn how taking 10 professional lessons can boost your logbook by 30 hours legally in New South Wales.', 'Transport for NSW allows learner drivers under 25 to claim 3 logbook hours for every 1 hour spent with an RMS accredited driving instructor, up to a maximum of 10 instructor hours (which gives you 30 hours of credit). Here is how to structure those 10 hours for maximum learning efficiency...', 'published', 980, '2026-10-28 10:30:00'),

(3, 'Automatic vs Manual: Which Licence Should You Choose in 2026?', 'automatic-vs-manual-which-licence-sydney', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800', 'Michael Zhang', 'Driving Tips', 'Comparing the benefits, test restrictions, and career implications of automatic and manual driving licences in NSW.', 'With the rise of electric vehicles and modern automatic transmissions, many learners wonder whether learning manual is still worth it. If you obtain an automatic P1 licence in NSW, you are restricted to driving automatic cars for the duration of your P1 stage unless supervised by a full licence holder...', 'published', 750, '2026-11-05 14:00:00');

-- 23. Gallery
INSERT INTO gallery (id, title, image_url, caption, category, is_published, sort_order) VALUES
(1, 'Chloe Passing First Go at Castle Hill RMS', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600', 'Huge congratulations to Chloe for acing her P1 test on the very first try!', 'student_passes', 1, 1),
(2, 'Our 2024 Toyota Corolla Hybrid Dual-Control Car', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600', 'Equipped with certified dual pedals and 5-star ANCAP safety features.', 'dual_control_cars', 1, 2),
(3, 'Ethan Celebrating His P1 Licence in Penrith', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600', 'Passed with a 98% score at Penrith Service NSW testing centre.', 'student_passes', 1, 3),
(4, 'Mock Test Training at Silverwater', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600', 'Instructor Kevin coaching mock test manoeuvres on real exam routes.', 'training_sessions', 1, 4);

-- 24. Website Pages
INSERT INTO website_pages (id, page_key, title, meta_description, sections_json) VALUES
(1, 'homepage', 'Home - EZY 2 LEARN Driving School Sydney', 'Sydney’s premier driving school offering RMS accredited driving instructors across Western Sydney, Inner West, and North Shore.', '{"hero":{"heading":"Master the Road with Confidence & Ease","subheading":"RMS-accredited driving instructors, 5-star ANCAP dual-control cars, and NSW 3-for-1 bonus logbook hours across Greater Sydney.","cta_text":"Book Driving Lesson","cta_phone":"1300 EZY LEARN","banner_badge":"98% First Time Pass Rate across Greater Sydney"},"about_preview":{"heading":"Why Greater Sydney Chooses EZY 2 LEARN","description":"We provide stress-free, patient, and modern driving education designed to make you a safe, skilled driver for life."}}'),

(2, 'about', 'About Us - EZY 2 LEARN Driving School', 'Learn about EZY 2 LEARN Driving School Sydney, our mission, values, and accredited instructor network.', '{"mission":"To deliver Sydney’s most supportive, professional, and confidence-building driving education experience.","stats":[{"number":"12+","label":"Years Serving Sydney"},{"number":"4,800+","label":"Successful P-Platers"},{"number":"98%","label":"First Time Pass Rate"},{"number":"4.9/5","label":"Average Student Rating"}]}');

-- 25. Website Settings & Business Profile
INSERT INTO website_settings (id, setting_key, setting_value, setting_group) VALUES
('1', 'business_name', 'EZY 2 LEARN Driving School', 'business'),
('2', 'business_abn', '84 928 319 402', 'business'),
('3', 'business_phone', '1300 399 532', 'business'),
('4', 'business_email', 'info@ezy2learn.com.au', 'business'),
('5', 'business_address', 'Suite 4, 32-36 Church Street, Parramatta NSW 2150', 'business'),
('6', 'operating_hours', 'Monday - Sunday: 7:00 AM - 7:00 PM', 'business'),
('7', 'currency', 'AUD', 'general'),
('8', 'timezone', 'Australia/Sydney', 'general'),
('9', 'cancellation_window_hours', '24', 'booking_policy'),
('10', 'refund_policy_summary', 'Cancellations made 24 hours prior to the scheduled lesson start time are eligible for a 100% full refund or credit.', 'booking_policy'),
('11', 'stripe_enabled', '1', 'payments'),
('12', 'bank_transfer_instructions', 'Commonwealth Bank | BSB: 062-000 | Account: 1092 8491 | Reference: [Your Booking Code]', 'payments'),
('13', 'email_notifications_enabled', '1', 'notifications'),
('14', 'sms_reminders_enabled', '1', 'notifications');

