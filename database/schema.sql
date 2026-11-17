-- EZY 2 LEARN Driving School - Complete Database Schema
-- Greater Sydney, New South Wales, Australia

DROP DATABASE IF EXISTS ezy2learn_db;
CREATE DATABASE ezy2learn_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ezy2learn_db;

-- 1. Roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Permissions
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Role Permissions
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Admin Users
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    remember_token VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- 5. States
CREATE TABLE states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50) DEFAULT 'Australia',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Cities / Regions
CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Suburbs
CREATE TABLE suburbs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    region VARCHAR(100) DEFAULT 'Greater Sydney',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_suburb_postcode (name, postcode)
) ENGINE=InnoDB;

-- 8. Instructors
CREATE TABLE instructors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_code VARCHAR(30) NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    accreditation_number VARCHAR(50) NOT NULL UNIQUE,
    accreditation_expiry DATE NULL,
    experience_years INT DEFAULT 1,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 75.00,
    transmission ENUM('automatic', 'manual', 'both') NOT NULL DEFAULT 'both',
    gender ENUM('male', 'female', 'other') DEFAULT 'male',
    bio TEXT,
    teaching_approach TEXT,
    qualifications TEXT,
    address VARCHAR(255),
    vehicle_make VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    vehicle_year INT NOT NULL,
    vehicle_rego VARCHAR(20) NOT NULL,
    is_dual_control TINYINT(1) DEFAULT 1,
    ancap_safety_rating INT DEFAULT 5,
    service_areas TEXT NULL,
    active_learners INT DEFAULT 0,
    total_lessons INT DEFAULT 0,
    status ENUM('active', 'inactive', 'on_leave', 'onboarding', 'pending_approval', 'suspended') DEFAULT 'active',
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_reviews INT DEFAULT 0,
    working_days JSON NULL,
    working_hours_start TIME DEFAULT '07:00:00',
    working_hours_end TIME DEFAULT '19:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_instructor_status (status),
    INDEX idx_instructor_transmission (transmission)
) ENGINE=InnoDB;

-- 9. Instructor Service Areas
CREATE TABLE instructor_service_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    suburb_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (suburb_id) REFERENCES suburbs(id) ON DELETE CASCADE,
    UNIQUE KEY uk_instructor_suburb (instructor_id, suburb_id)
) ENGINE=InnoDB;

-- 10. Instructor Documents
CREATE TABLE instructor_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    document_type ENUM('driving_instructor_licence', 'working_with_children_check', 'police_check', 'vehicle_insurance', 'dual_control_cert', 'first_aid', 'other') NOT NULL,
    title VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    expiry_date DATE NULL,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'verified',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Instructor Availability Slots
CREATE TABLE instructor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday ... 6=Saturday',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    specific_date DATE NULL COMMENT 'For custom date overrides',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    INDEX idx_avail_day_time (instructor_id, day_of_week, start_time, end_time)
) ENGINE=InnoDB;

-- 12. Students
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_code VARCHAR(30) NULL,
    name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    date_of_birth DATE NULL,
    address VARCHAR(255),
    suburb VARCHAR(100) NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    licence_number VARCHAR(50) DEFAULT NULL,
    licence_stage ENUM('learner', 'provisional_p1', 'provisional_p2', 'full_licence', 'overseas_conversion') DEFAULT 'learner',
    licence_status VARCHAR(50) DEFAULT 'Valid',
    preferred_transmission ENUM('automatic', 'manual', 'no_preference') DEFAULT 'automatic',
    preferred_instructor_id INT NULL,
    learning_objective VARCHAR(255) DEFAULT 'Pass Driving Test on First Attempt',
    completed_lessons INT DEFAULT 0,
    remaining_lessons INT DEFAULT 0,
    recorded_instructor_hours DECIMAL(5,1) DEFAULT 0.0,
    nsw_logbook_hours DECIMAL(5,1) DEFAULT 0.0 COMMENT 'Includes 3-for-1 bonus hours where applicable',
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    pending_payments DECIMAL(10,2) DEFAULT 0.00,
    emergency_contact_name VARCHAR(100) DEFAULT NULL,
    emergency_contact_phone VARCHAR(30) DEFAULT NULL,
    status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (preferred_instructor_id) REFERENCES instructors(id) ON DELETE SET NULL,
    INDEX idx_student_status (status)
) ENGINE=InnoDB;

-- 13. Services
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    category ENUM('standard', 'test_preparation', 'car_hire', 'specialised', 'refresher') DEFAULT 'standard',
    transmission ENUM('automatic', 'manual', 'both') DEFAULT 'both',
    duration_minutes INT NOT NULL DEFAULT 60,
    price_aud DECIMAL(10,2) NOT NULL,
    description TEXT,
    included_features JSON NULL,
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 14. Packages
CREATE TABLE packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    lesson_count INT NOT NULL DEFAULT 5,
    duration_per_lesson INT NOT NULL DEFAULT 60,
    price_aud DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    popular_badge TINYINT(1) DEFAULT 0,
    description TEXT,
    features JSON NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 15. Package Services
CREATE TABLE package_services (
    package_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    PRIMARY KEY (package_id, service_id),
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. Bookings
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(30) NOT NULL UNIQUE,
    student_id INT NOT NULL,
    instructor_id INT NULL,
    service_id INT NULL,
    package_id INT NULL,
    transmission ENUM('automatic', 'manual') NOT NULL DEFAULT 'automatic',
    lesson_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    lesson_package VARCHAR(100) NULL,
    lesson_category VARCHAR(100) NULL,
    number_of_lessons INT DEFAULT 1,
    pickup_address VARCHAR(255) NOT NULL,
    pickup_suburb VARCHAR(100) NOT NULL,
    pickup_postcode VARCHAR(10) NOT NULL,
    dropoff_address VARCHAR(255) NULL,
    special_notes TEXT,
    student_notes TEXT NULL,
    special_requirements TEXT NULL,
    admin_notes TEXT NULL,
    rescheduling_history TEXT NULL,
    amount_aud DECIMAL(10,2) NOT NULL,
    discount_aud DECIMAL(10,2) DEFAULT 0.00,
    final_amount_aud DECIMAL(10,2) DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    transaction_id VARCHAR(100) NULL,
    booking_status ENUM('upcoming', 'new_request', 'pending', 'confirmed', 'assigned', 'completed', 'cancelled', 'rescheduled') DEFAULT 'pending',
    payment_status ENUM('paid', 'pending', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    cancellation_reason TEXT NULL,
    created_by_admin_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_booking_date (lesson_date),
    INDEX idx_booking_status (booking_status),
    INDEX idx_booking_payment (payment_status),
    INDEX idx_booking_instructor_date (instructor_id, lesson_date)
) ENGINE=InnoDB;

-- 17. Booking History / Audit Trail
CREATE TABLE booking_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    admin_user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    previous_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 18. Payments / Transactions
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    booking_id INT NOT NULL,
    student_id INT NOT NULL,
    amount_aud DECIMAL(10,2) NOT NULL,
    payment_method ENUM('credit_card', 'stripe', 'bank_transfer', 'cash', 'gift_card') DEFAULT 'credit_card',
    payment_status ENUM('paid', 'pending', 'failed', 'refunded', 'partially_refunded') DEFAULT 'paid',
    receipt_number VARCHAR(50) DEFAULT NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    refund_reason VARCHAR(255) NULL,
    paid_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (paid_at)
) ENGINE=InnoDB;

-- 19. Reviews
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NULL,
    student_id INT NOT NULL,
    instructor_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    is_featured TINYINT(1) DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    INDEX idx_review_status (status)
) ENGINE=InnoDB;

-- 20. Notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    category ENUM('booking', 'student', 'instructor', 'payment', 'review', 'system') NOT NULL,
    related_id INT NULL,
    link_url VARCHAR(255) NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_read (is_read),
    INDEX idx_notif_cat (category)
) ENGINE=InnoDB;

-- 21. FAQs
CREATE TABLE faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) DEFAULT 'General',
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    is_published TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 22. Blogs
CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    featured_image VARCHAR(255) NULL,
    author_name VARCHAR(100) DEFAULT 'EZY 2 LEARN Driving Team',
    category VARCHAR(50) DEFAULT 'Driving Tips',
    summary TEXT,
    content LONGTEXT NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    views_count INT DEFAULT 0,
    published_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 23. Gallery
CREATE TABLE gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255) NULL,
    category ENUM('student_passes', 'dual_control_cars', 'training_sessions', 'events') DEFAULT 'student_passes',
    is_published TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 24. Website Pages & Sections
CREATE TABLE website_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_key VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    meta_description VARCHAR(255) NULL,
    sections_json JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 25. Website Settings & Business Profile
CREATE TABLE website_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value LONGTEXT NOT NULL,
    setting_group ENUM('general', 'business', 'booking_policy', 'payments', 'notifications') DEFAULT 'general',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 26. Activity Logs
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_activity_created (created_at)
) ENGINE=InnoDB;

