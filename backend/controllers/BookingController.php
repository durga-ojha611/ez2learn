<?php
// backend/controllers/BookingController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class BookingController {
    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 15)));
        $offset = ($page - 1) * $limit;

        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $instructorId = trim($_GET['instructor_id'] ?? '');
        $paymentStatus = trim($_GET['payment_status'] ?? '');
        $suburb = trim($_GET['suburb'] ?? '');
        $transmission = trim($_GET['transmission'] ?? '');
        $startDate = trim($_GET['start_date'] ?? '');
        $endDate = trim($_GET['end_date'] ?? '');

        $where = ['1=1'];
        $params = [];

        if ($search !== '') {
            $where[] = '(b.booking_code LIKE ? OR s.name LIKE ? OR s.email LIKE ? OR b.pickup_suburb LIKE ?)';
            $searchWild = "%{$search}%";
            $params[] = $searchWild;
            $params[] = $searchWild;
            $params[] = $searchWild;
            $params[] = $searchWild;
        }

        if ($status !== '' && $status !== 'all') {
            $where[] = 'b.booking_status = ?';
            $params[] = $status;
        }

        if ($instructorId !== '' && $instructorId !== 'all') {
            $where[] = 'b.instructor_id = ?';
            $params[] = $instructorId;
        }

        if ($paymentStatus !== '' && $paymentStatus !== 'all') {
            $where[] = 'b.payment_status = ?';
            $params[] = $paymentStatus;
        }

        if ($suburb !== '' && $suburb !== 'all') {
            $where[] = 'b.pickup_suburb = ?';
            $params[] = $suburb;
        }

        if ($transmission !== '' && $transmission !== 'all') {
            $where[] = 'b.transmission = ?';
            $params[] = $transmission;
        }

        if ($startDate !== '') {
            $where[] = 'b.lesson_date >= ?';
            $params[] = $startDate;
        }

        if ($endDate !== '') {
            $where[] = 'b.lesson_date <= ?';
            $params[] = $endDate;
        }

        $whereSql = implode(' AND ', $where);

        // Count total
        $countStmt = $db->prepare("
            SELECT COUNT(*) 
            FROM bookings b
            JOIN students s ON b.student_id = s.id
            WHERE {$whereSql}
        ");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        // Fetch paginated
        $sql = "
            SELECT b.*,
                   s.student_code, s.name as student_name, s.email as student_email, s.phone as student_phone, s.avatar_url as student_avatar, s.licence_stage, s.licence_status, s.licence_number, s.completed_lessons as student_completed_lessons, s.nsw_logbook_hours, s.emergency_contact_name, s.emergency_contact_phone,
                   i.instructor_code, i.name as instructor_name, i.phone as instructor_phone, i.avatar_url as instructor_avatar, i.vehicle_make, i.vehicle_model, i.vehicle_rego, i.accreditation_number as instructor_accreditation, i.rating as instructor_rating,
                   srv.name as service_name, srv.duration_minutes as service_duration,
                   pkg.name as package_name
            FROM bookings b
            JOIN students s ON b.student_id = s.id
            LEFT JOIN instructors i ON b.instructor_id = i.id
            LEFT JOIN services srv ON b.service_id = srv.id
            LEFT JOIN packages pkg ON b.package_id = pkg.id
            WHERE {$whereSql}
            ORDER BY b.lesson_date DESC, b.start_time DESC
            LIMIT {$limit} OFFSET {$offset}
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll();

        // Booking Dashboard Statistics as specified:
        // Total Bookings, Upcoming Bookings, Pending Bookings, Completed Bookings, Cancelled Bookings, Total Booking Revenue
        $stats = [
            'total_bookings' => (int)$db->query("SELECT COUNT(*) FROM bookings")->fetchColumn(),
            'upcoming_bookings' => (int)$db->query("SELECT COUNT(*) FROM bookings WHERE lesson_date >= CURDATE() AND booking_status NOT IN ('cancelled', 'completed')")->fetchColumn(),
            'pending_bookings' => (int)$db->query("SELECT COUNT(*) FROM bookings WHERE booking_status IN ('pending', 'new_request')")->fetchColumn(),
            'completed_bookings' => (int)$db->query("SELECT COUNT(*) FROM bookings WHERE booking_status = 'completed'")->fetchColumn(),
            'cancelled_bookings' => (int)$db->query("SELECT COUNT(*) FROM bookings WHERE booking_status = 'cancelled'")->fetchColumn(),
            'total_revenue' => (float)$db->query("SELECT COALESCE(SUM(amount_aud), 0) FROM bookings WHERE payment_status = 'paid'")->fetchColumn(),
        ];

        Response::paginate($bookings, $total, $page, $limit, 'Bookings retrieved', ['stats' => $stats]);
    }

    public function show(int $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT b.*,
                   s.student_code, s.name as student_name, s.email as student_email, s.phone as student_phone, s.avatar_url as student_avatar, s.licence_stage, s.licence_status, s.licence_number, s.emergency_contact_name, s.emergency_contact_phone, s.nsw_logbook_hours, s.completed_lessons as student_completed_lessons,
                   i.instructor_code, i.name as instructor_name, i.email as instructor_email, i.phone as instructor_phone, i.avatar_url as instructor_avatar, i.vehicle_make, i.vehicle_model, i.vehicle_year, i.vehicle_rego, i.is_dual_control, i.accreditation_number,
                   srv.name as service_name, srv.description as service_description,
                   pkg.name as package_name
            FROM bookings b
            JOIN students s ON b.student_id = s.id
            LEFT JOIN instructors i ON b.instructor_id = i.id
            LEFT JOIN services srv ON b.service_id = srv.id
            LEFT JOIN packages pkg ON b.package_id = pkg.id
            WHERE b.id = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) {
            Response::error('Booking not found', 404);
        }

        // Fetch history audit trail
        $histStmt = $db->prepare("
            SELECT h.*, u.name as admin_name
            FROM booking_history h
            LEFT JOIN admin_users u ON h.admin_user_id = u.id
            WHERE h.booking_id = ?
            ORDER BY h.created_at DESC
        ");
        $histStmt->execute([$id]);
        $booking['history'] = $histStmt->fetchAll();

        // Fetch associated payments
        $payStmt = $db->prepare("
            SELECT * FROM payments WHERE booking_id = ? ORDER BY id DESC
        ");
        $payStmt->execute([$id]);
        $booking['payments'] = $payStmt->fetchAll();

        Response::success($booking, 'Booking details retrieved');
    }

    public function store(): void {
        // Authenticate admin if token present, or allow public student checkout
        $user = null;
        $token = Auth::getBearerToken();
        $db = Database::getConnection();

        if ($token) {
            $payload = Auth::verifyToken($token);
            if ($payload && isset($payload['user_id'])) {
                $uStmt = $db->prepare("SELECT id, name FROM admin_users WHERE id = ?");
                $uStmt->execute([$payload['user_id']]);
                $user = $uStmt->fetch();
            }
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        // 1. Resolve or create/update student
        $studentEmail = trim($input['student_email'] ?? ($input['email'] ?? ''));
        $studentName = trim($input['student_name'] ?? '');
        $firstName = trim($input['first_name'] ?? '');
        $lastName = trim($input['last_name'] ?? '');

        if (!$studentName && ($firstName || $lastName)) {
            $studentName = trim("{$firstName} {$lastName}");
        }
        if (!$studentName) {
            $studentName = 'Learner Student';
        }
        if (!$firstName && $studentName) {
            $parts = explode(' ', $studentName);
            $firstName = $parts[0];
            $lastName = count($parts) > 1 ? end($parts) : '';
        }

        $studentPhone = trim($input['student_phone'] ?? ($input['phone'] ?? ($input['mobile'] ?? '')));
        $pickupAddress = trim($input['pickup_address'] ?? ($input['pickup_street'] ?? '45 Church Street'));
        $pickupSuburb = trim($input['pickup_suburb'] ?? 'Parramatta');
        $pickupPostcode = trim($input['pickup_postcode'] ?? '2150');
        $licenceStage = $input['licence_stage'] ?? ($input['licence_type'] ?? 'learner');
        if (str_contains(strtolower($licenceStage), 'learner')) $licenceStage = 'learner';
        elseif (str_contains(strtolower($licenceStage), 'p1')) $licenceStage = 'provisional_p1';
        elseif (str_contains(strtolower($licenceStage), 'p2')) $licenceStage = 'provisional_p2';
        elseif (str_contains(strtolower($licenceStage), 'overseas')) $licenceStage = 'overseas_conversion';
        else $licenceStage = 'learner';

        $licenceNumber = trim($input['licence_number'] ?? '');
        $logbookHours = (float)($input['logbook_hours'] ?? 0);
        $dob = !empty($input['date_of_birth']) ? date('Y-m-d', strtotime(str_replace('/', '-', $input['date_of_birth']))) : null;
        $emergencyName = trim($input['emergency_contact_name'] ?? ($input['emergency_name'] ?? ''));
        $emergencyPhone = trim($input['emergency_contact_phone'] ?? ($input['emergency_phone'] ?? ''));

        $studentId = !empty($input['student_id']) ? (int)$input['student_id'] : null;
        if (!$studentId && $studentEmail) {
            $checkStudent = $db->prepare("SELECT id FROM students WHERE email = ? LIMIT 1");
            $checkStudent->execute([$studentEmail]);
            $existingStudent = $checkStudent->fetch();
            if ($existingStudent) {
                $studentId = (int)$existingStudent['id'];
                // Update student details with new booking info
                $updStudent = $db->prepare("
                    UPDATE students SET
                        name = COALESCE(?, name),
                        first_name = COALESCE(?, first_name),
                        last_name = COALESCE(?, last_name),
                        phone = COALESCE(?, phone),
                        address = COALESCE(?, address),
                        suburb = COALESCE(?, suburb),
                        postcode = COALESCE(?, postcode),
                        licence_number = COALESCE(?, licence_number),
                        licence_stage = COALESCE(?, licence_stage),
                        emergency_contact_name = COALESCE(?, emergency_contact_name),
                        emergency_contact_phone = COALESCE(?, emergency_contact_phone),
                        date_of_birth = COALESCE(?, date_of_birth)
                    WHERE id = ?
                ");
                $updStudent->execute([
                    $studentName, $firstName, $lastName, $studentPhone ?: null,
                    $pickupAddress, $pickupSuburb, $pickupPostcode,
                    $licenceNumber ?: null, $licenceStage,
                    $emergencyName ?: null, $emergencyPhone ?: null,
                    $dob, $studentId
                ]);
            } else {
                $studentCode = 'STU-' . rand(1000, 9999);
                $insertStudent = $db->prepare("
                    INSERT INTO students (
                        student_code, name, first_name, last_name, email, phone, date_of_birth,
                        address, suburb, postcode, licence_number, licence_stage, nsw_logbook_hours,
                        emergency_contact_name, emergency_contact_phone, preferred_transmission, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                ");
                $insertStudent->execute([
                    $studentCode,
                    $studentName,
                    $firstName,
                    $lastName,
                    $studentEmail,
                    $studentPhone,
                    $dob,
                    $pickupAddress,
                    $pickupSuburb,
                    $pickupPostcode,
                    $licenceNumber ?: null,
                    $licenceStage,
                    $logbookHours,
                    $emergencyName ?: null,
                    $emergencyPhone ?: null,
                    $input['transmission'] ?? 'automatic'
                ]);
                $studentId = (int)$db->lastInsertId();
            }
        }

        if (!$studentId) {
            Response::error('A valid student email or student ID is required for booking.', 422);
        }

        // 2. Resolve primary lesson date, start time, and duration
        $lessonDate = $input['lesson_date'] ?? null;
        $startTime = $input['start_time'] ?? null;
        $duration = !empty($input['duration_minutes']) ? (int)$input['duration_minutes'] : (!empty($input['lesson_length_hours']) ? (int)$input['lesson_length_hours'] * 60 : 120);

        if (!empty($input['booked_slots']) && is_array($input['booked_slots']) && count($input['booked_slots']) > 0) {
            $firstSlot = $input['booked_slots'][0];
            $lessonDate = $firstSlot['date'] ?? $lessonDate;
            if (!empty($firstSlot['time'])) {
                // e.g. "10:00 - 12:00" -> "10:00"
                $parts = explode('-', $firstSlot['time']);
                $startTime = trim($parts[0]);
            }
            if (!empty($firstSlot['duration'])) {
                $duration = (int)$firstSlot['duration'] * 60;
            }
        }

        if (!$lessonDate) {
            $lessonDate = date('Y-m-d', strtotime('+3 days'));
        }
        if (!$startTime) {
            $startTime = '10:00';
        }
        if (strlen($startTime) === 5) {
            $startTime .= ':00';
        }

        $endTime = date('H:i:s', strtotime("{$startTime} + {$duration} minutes"));

        // 3. Resolve Instructor
        $instructorId = !empty($input['instructor_id']) ? (int)$input['instructor_id'] : 1;
        $instStmt = $db->prepare("SELECT name, email FROM instructors WHERE id = ?");
        $instStmt->execute([$instructorId]);
        $instructorRow = $instStmt->fetch();
        $instructorName = $instructorRow['name'] ?? 'Assigned Instructor';

        // 4. Financials & Booking codes
        $amountAud = (float)($input['amount_aud'] ?? ($input['subtotal'] ?? 150.00));
        $discountAud = (float)($input['discount_aud'] ?? ($input['discount_amount'] ?? 0));
        $finalAmountAud = !empty($input['final_amount_aud']) ? (float)$input['final_amount_aud'] : (!empty($input['total_amount']) ? (float)$input['total_amount'] : max(0, $amountAud - $discountAud));

        $bookingCode = !empty($input['booking_code']) ? $input['booking_code'] : ('EZY-' . rand(100000, 999999));
        $status = !empty($input['booking_status']) ? $input['booking_status'] : 'confirmed';
        $paymentStatus = !empty($input['payment_status']) ? $input['payment_status'] : 'paid';
        $paymentMethod = !empty($input['payment_method']) ? $input['payment_method'] : 'Credit Card';
        $txnId = !empty($input['transaction_id']) ? $input['transaction_id'] : ('TXN-' . date('Y') . '-' . rand(10000, 99999));
        $receiptNumber = 'RCP-' . rand(100000, 999999);

        // Serialize full schedule & special requirements
        $bookedSlotsJson = !empty($input['booked_slots']) ? json_encode($input['booked_slots']) : null;
        $specialRequirements = !empty($input['prefer_calm_instructor']) ? 'Calm, patient instructor preferred. ' : '';
        if (!empty($input['special_requirements'])) {
            $specialRequirements .= $input['special_requirements'];
        }

        $stmt = $db->prepare("
            INSERT INTO bookings (
                booking_code, student_id, instructor_id, service_id, package_id,
                transmission, lesson_date, start_time, end_time, duration_minutes,
                lesson_package, lesson_category, pickup_address, pickup_suburb, pickup_postcode, dropoff_address,
                special_notes, student_notes, special_requirements, admin_notes,
                amount_aud, discount_aud, final_amount_aud, payment_method, transaction_id,
                booking_status, payment_status, created_by_admin_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $bookingCode,
            $studentId,
            $instructorId,
            !empty($input['service_id']) ? (int)$input['service_id'] : null,
            !empty($input['package_id']) ? (int)$input['package_id'] : null,
            $input['transmission'] ?? 'automatic',
            $lessonDate,
            $startTime,
            $endTime,
            $duration,
            $input['lesson_package'] ?? ($input['package_type'] ?? 'Driving Lesson Package'),
            $input['lesson_category'] ?? 'Standard',
            $pickupAddress,
            $pickupSuburb,
            $pickupPostcode,
            $input['dropoff_address'] ?? $pickupAddress,
            $input['special_notes'] ?? null,
            $bookedSlotsJson,
            $specialRequirements ?: null,
            $user ? ("Created by admin: " . $user['name']) : 'Booked online via Website Booking Funnel',
            $amountAud,
            $discountAud,
            $finalAmountAud,
            $paymentMethod,
            $txnId,
            $status,
            $paymentStatus,
            $user['id'] ?? null
        ]);

        $bookingId = (int)$db->lastInsertId();

        // 5. Insert payment record
        if ($paymentStatus === 'paid') {
            $paymentMethodEnum = 'credit_card';
            $pLower = strtolower($paymentMethod);
            if (str_contains($pLower, 'cash')) $paymentMethodEnum = 'cash';
            elseif (str_contains($pLower, 'bank') || str_contains($pLower, 'transfer')) $paymentMethodEnum = 'bank_transfer';
            elseif (str_contains($pLower, 'stripe')) $paymentMethodEnum = 'stripe';

            $db->prepare("
                INSERT INTO payments (transaction_id, booking_id, student_id, amount_aud, payment_method, payment_status, receipt_number, paid_at)
                VALUES (?, ?, ?, ?, ?, 'paid', ?, NOW())
            ")->execute([
                $txnId,
                $bookingId,
                $studentId,
                $finalAmountAud,
                $paymentMethodEnum,
                $receiptNumber
            ]);
        }

        // 6. Insert audit trail in booking_history
        $db->prepare("
            INSERT INTO booking_history (booking_id, admin_user_id, action, new_status, comment)
            VALUES (?, ?, 'created', ?, ?)
        ")->execute([
            $bookingId,
            $user['id'] ?? null,
            $status,
            $user ? ("Booking created by admin " . $user['name']) : "Online booking confirmed by learner {$studentName}"
        ]);

        // 7. Insert Notification for Admin Portal
        $totalHours = !empty($input['total_hours']) ? (int)$input['total_hours'] : round($duration / 60);
        $db->prepare("
            INSERT INTO notifications (title, message, category, related_id, link_url, is_read, created_at)
            VALUES (?, ?, 'booking', ?, ?, 0, NOW())
        ")->execute([
            "New Booking: #{$bookingCode}",
            "{$studentName} booked {$totalHours} hrs with {$instructorName}. Total paid: \${$finalAmountAud} AUD.",
            $bookingId,
            "/bookings?search={$bookingCode}"
        ]);

        // 8. Return response
        Response::success([
            'id' => $bookingId,
            'booking_code' => $bookingCode,
            'receipt_number' => $receiptNumber,
            'student_id' => $studentId,
            'student_name' => $studentName,
            'instructor_name' => $instructorName,
            'amount_paid' => $finalAmountAud,
            'lesson_date' => $lessonDate,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'payment_method' => $paymentMethod,
            'transaction_id' => $txnId
        ], 'Booking and payment confirmed successfully', 201);
    }

    public function update(int $id): void {
        $user = AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();
        $currentStmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
        $currentStmt->execute([$id]);
        $current = $currentStmt->fetch();

        if (!$current) {
            Response::error('Booking not found', 404);
        }

        $stmt = $db->prepare("
            UPDATE bookings SET
                service_id = COALESCE(?, service_id),
                transmission = COALESCE(?, transmission),
                lesson_date = COALESCE(?, lesson_date),
                start_time = COALESCE(?, start_time),
                end_time = COALESCE(?, end_time),
                duration_minutes = COALESCE(?, duration_minutes),
                lesson_package = COALESCE(?, lesson_package),
                lesson_category = COALESCE(?, lesson_category),
                pickup_address = COALESCE(?, pickup_address),
                pickup_suburb = COALESCE(?, pickup_suburb),
                pickup_postcode = COALESCE(?, pickup_postcode),
                dropoff_address = COALESCE(?, dropoff_address),
                special_notes = COALESCE(?, special_notes),
                student_notes = COALESCE(?, student_notes),
                special_requirements = COALESCE(?, special_requirements),
                admin_notes = COALESCE(?, admin_notes),
                amount_aud = COALESCE(?, amount_aud),
                discount_aud = COALESCE(?, discount_aud),
                final_amount_aud = COALESCE(?, final_amount_aud),
                payment_method = COALESCE(?, payment_method),
                payment_status = COALESCE(?, payment_status),
                booking_status = COALESCE(?, booking_status)
            WHERE id = ?
        ");

        $stmt->execute([
            $input['service_id'] ?? null,
            $input['transmission'] ?? null,
            $input['lesson_date'] ?? null,
            $input['start_time'] ?? null,
            $input['end_time'] ?? null,
            $input['duration_minutes'] ?? null,
            $input['lesson_package'] ?? null,
            $input['lesson_category'] ?? null,
            $input['pickup_address'] ?? null,
            $input['pickup_suburb'] ?? null,
            $input['pickup_postcode'] ?? null,
            $input['dropoff_address'] ?? null,
            $input['special_notes'] ?? null,
            $input['student_notes'] ?? null,
            $input['special_requirements'] ?? null,
            $input['admin_notes'] ?? null,
            $input['amount_aud'] ?? null,
            $input['discount_aud'] ?? null,
            $input['final_amount_aud'] ?? null,
            $input['payment_method'] ?? null,
            $input['payment_status'] ?? null,
            $input['booking_status'] ?? ($input['status'] ?? null),
            $id
        ]);

        $db->prepare("
            INSERT INTO booking_history (booking_id, admin_user_id, action, comment)
            VALUES (?, ?, 'details_updated', 'Booking details updated by admin')
        ")->execute([$id, $user['id']]);

        Response::success(null, 'Booking updated successfully');
    }

    public function updateStatus(int $id): void {
        $user = AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $newStatus = $input['status'] ?? '';
        $comment = $input['comment'] ?? 'Status updated';

        $allowed = ['upcoming', 'new_request', 'pending', 'confirmed', 'assigned', 'completed', 'cancelled', 'rescheduled'];
        if (!in_array($newStatus, $allowed)) {
            Response::error('Invalid status value', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) {
            Response::error('Booking not found', 404);
        }

        $prevStatus = $booking['booking_status'];

        $upd = $db->prepare("UPDATE bookings SET booking_status = ? WHERE id = ?");
        $upd->execute([$newStatus, $id]);

        // If marked completed, update student completed lessons and logbook hours!
        if ($newStatus === 'completed' && $prevStatus !== 'completed') {
            $hours = round($booking['duration_minutes'] / 60, 1);
            // NSW 3-for-1 bonus logic: 1 professional instructor hour = 3 logbook hours (up to 10 hours max)
            $db->prepare("
                UPDATE students SET
                    completed_lessons = completed_lessons + 1,
                    recorded_instructor_hours = recorded_instructor_hours + ?,
                    nsw_logbook_hours = LEAST(30.0, nsw_logbook_hours + (? * 3))
                WHERE id = ?
            ")->execute([$hours, $hours, $booking['student_id']]);
        }

        $db->prepare("
            INSERT INTO booking_history (booking_id, admin_user_id, action, previous_status, new_status, comment)
            VALUES (?, ?, 'status_change', ?, ?, ?)
        ")->execute([$id, $user['id'], $prevStatus, $newStatus, $comment]);

        Response::success(null, "Booking status changed to '{$newStatus}'");
    }

    public function assignInstructor(int $id): void {
        $user = AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $instructorId = (int)($input['instructor_id'] ?? 0);

        if (!$instructorId) {
            Response::error('Instructor ID is required', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) {
            Response::error('Booking not found', 404);
        }

        // Fetch instructor name
        $instStmt = $db->prepare("SELECT name FROM instructors WHERE id = ?");
        $instStmt->execute([$instructorId]);
        $instructorName = $instStmt->fetchColumn();

        if (!$instructorName) {
            Response::error('Instructor not found', 404);
        }

        // Check conflicts
        $conflictStmt = $db->prepare("
            SELECT id FROM bookings
            WHERE instructor_id = ? 
              AND lesson_date = ?
              AND id != ?
              AND booking_status NOT IN ('cancelled')
              AND (
                (start_time <= ? AND end_time > ?) OR
                (start_time < ? AND end_time >= ?) OR
                (start_time >= ? AND end_time <= ?)
              )
            LIMIT 1
        ");
        $conflictStmt->execute([
            $instructorId,
            $booking['lesson_date'],
            $id,
            $booking['start_time'], $booking['start_time'],
            $booking['end_time'], $booking['end_time'],
            $booking['start_time'], $booking['end_time']
        ]);
        if ($conflictStmt->fetch()) {
            Response::error("{$instructorName} already has another booking during this time slot.", 409);
        }

        $db->prepare("UPDATE bookings SET instructor_id = ?, booking_status = 'assigned' WHERE id = ?")->execute([$instructorId, $id]);

        $db->prepare("
            INSERT INTO booking_history (booking_id, admin_user_id, action, previous_status, new_status, comment)
            VALUES (?, ?, 'assigned_instructor', ?, 'assigned', ?)
        ")->execute([$id, $user['id'], $booking['booking_status'], "Assigned instructor to {$instructorName}"]);

        Response::success(null, "Instructor {$instructorName} assigned successfully");
    }

    public function reschedule(int $id): void {
        $user = AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator($input);
        if (!$validator->validate([
            'new_date' => 'required',
            'new_start_time' => 'required'
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) {
            Response::error('Booking not found', 404);
        }

        $newDate = $input['new_date'];
        $newStartTime = $input['new_start_time'];
        $duration = (int)$booking['duration_minutes'];
        $newEndTime = date('H:i:s', strtotime("{$newStartTime} + {$duration} minutes"));

        // Conflict check
        if ($booking['instructor_id']) {
            $conflictStmt = $db->prepare("
                SELECT id FROM bookings
                WHERE instructor_id = ? 
                  AND lesson_date = ?
                  AND id != ?
                  AND booking_status NOT IN ('cancelled')
                  AND (
                    (start_time <= ? AND end_time > ?) OR
                    (start_time < ? AND end_time >= ?) OR
                    (start_time >= ? AND end_time <= ?)
                  )
                LIMIT 1
            ");
            $conflictStmt->execute([
                $booking['instructor_id'],
                $newDate,
                $id,
                $newStartTime, $newStartTime,
                $newEndTime, $newEndTime,
                $newStartTime, $newEndTime
            ]);
            if ($conflictStmt->fetch()) {
                Response::error('Instructor is unavailable at the requested rescheduled time.', 409);
            }
        }

        $prevDate = $booking['lesson_date'] . ' ' . $booking['start_time'];

        $db->prepare("
            UPDATE bookings SET
                lesson_date = ?,
                start_time = ?,
                end_time = ?,
                booking_status = 'rescheduled'
            WHERE id = ?
        ")->execute([$newDate, $newStartTime, $newEndTime, $id]);

        $db->prepare("
            INSERT INTO booking_history (booking_id, admin_user_id, action, previous_status, new_status, comment)
            VALUES (?, ?, 'rescheduled', ?, 'rescheduled', ?)
        ")->execute([
            $id,
            $user['id'],
            $booking['booking_status'],
            "Rescheduled from {$prevDate} to {$newDate} {$newStartTime}. Reason: " . ($input['reason'] ?? 'Requested by student/admin')
        ]);

        Response::success(null, 'Booking rescheduled successfully');
    }

    public function refund(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'booking_manager']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $reason = $input['reason'] ?? 'Customer refund requested';

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) {
            Response::error('Booking not found', 404);
        }

        $refundAmount = !empty($input['refund_amount']) ? (float)$input['refund_amount'] : (float)$booking['amount_aud'];

        $db->prepare("
            UPDATE bookings SET
                payment_status = 'refunded',
                booking_status = 'cancelled',
                cancellation_reason = ?
            WHERE id = ?
        ")->execute(["Refund processed: " . $reason, $id]);

        $payStmt = $db->prepare("SELECT id FROM payments WHERE booking_id = ? ORDER BY id DESC LIMIT 1");
        $payStmt->execute([$id]);
        $payId = $payStmt->fetchColumn();

        if ($payId) {
            $db->prepare("
                UPDATE payments SET
                    payment_status = 'refunded',
                    refund_amount = ?,
                    refund_reason = ?
                WHERE id = ?
            ")->execute([$refundAmount, $reason, $payId]);
        } else {
            $txnId = 'REF-' . date('Y') . '-' . rand(1000, 9999);
            $db->prepare("
                INSERT INTO payments (transaction_id, booking_id, student_id, amount_aud, payment_method, payment_status, refund_amount, refund_reason, paid_at)
                VALUES (?, ?, ?, ?, 'credit_card', 'refunded', ?, ?, NOW())
            ")->execute([$txnId, $id, $booking['student_id'], $booking['amount_aud'], $refundAmount, $reason]);
        }

        $user = AuthMiddleware::authenticate();
        $db->prepare("
            INSERT INTO booking_history (booking_id, admin_user_id, action, previous_status, new_status, comment)
            VALUES (?, ?, 'refund_processed', ?, 'cancelled', ?)
        ")->execute([$id, $user['id'], $booking['booking_status'], "Refund of \${$refundAmount} AUD processed. Reason: {$reason}"]);

        Response::success(null, "Refund of \${$refundAmount} AUD processed successfully");
    }

    public function delete(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'booking_manager']);
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM bookings WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(null, 'Booking deleted successfully');
    }
}

