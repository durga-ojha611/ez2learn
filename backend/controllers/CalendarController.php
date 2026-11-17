<?php
// backend/controllers/CalendarController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class CalendarController {
    public function getEvents(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $startDate = trim($_GET['start_date'] ?? date('Y-m-01'));
        $endDate = trim($_GET['end_date'] ?? date('Y-m-t', strtotime('+1 month')));
        $instructorId = trim($_GET['instructor_id'] ?? '');
        $serviceId = trim($_GET['service_id'] ?? '');

        $where = ['b.lesson_date >= ? AND b.lesson_date <= ? AND b.booking_status != "cancelled"'];
        $params = [$startDate, $endDate];

        if ($instructorId !== '' && $instructorId !== 'all') {
            $where[] = 'b.instructor_id = ?';
            $params[] = $instructorId;
        }

        if ($serviceId !== '' && $serviceId !== 'all') {
            $where[] = 'b.service_id = ?';
            $params[] = $serviceId;
        }

        $whereSql = implode(' AND ', $where);

        $stmt = $db->prepare("
            SELECT b.id, b.booking_code, b.lesson_date, b.start_time, b.end_time, b.duration_minutes,
                   b.pickup_address, b.pickup_suburb, b.transmission, b.amount_aud, b.booking_status, b.payment_status,
                   s.id as student_id, s.name as student_name, s.phone as student_phone, s.avatar_url as student_avatar,
                   i.id as instructor_id, i.name as instructor_name, i.phone as instructor_phone, i.avatar_url as instructor_avatar, i.vehicle_rego,
                   srv.name as service_name
            FROM bookings b
            JOIN students s ON b.student_id = s.id
            LEFT JOIN instructors i ON b.instructor_id = i.id
            LEFT JOIN services srv ON b.service_id = srv.id
            WHERE {$whereSql}
            ORDER BY b.lesson_date ASC, b.start_time ASC
        ");
        $stmt->execute($params);
        $events = $stmt->fetchAll();

        // Format for calendar UI
        $formatted = array_map(function ($ev) {
            $startDateTime = "{$ev['lesson_date']}T{$ev['start_time']}";
            $endDateTime = "{$ev['lesson_date']}T{$ev['end_time']}";

            return [
                'id' => $ev['id'],
                'booking_code' => $ev['booking_code'],
                'title' => "{$ev['student_name']} - {$ev['service_name']}",
                'start' => $startDateTime,
                'end' => $endDateTime,
                'lesson_date' => $ev['lesson_date'],
                'start_time' => substr($ev['start_time'], 0, 5),
                'end_time' => substr($ev['end_time'], 0, 5),
                'student' => [
                    'id' => $ev['student_id'],
                    'name' => $ev['student_name'],
                    'phone' => $ev['student_phone'],
                    'avatar' => $ev['student_avatar']
                ],
                'instructor' => [
                    'id' => $ev['instructor_id'],
                    'name' => $ev['instructor_name'] ?? 'Unassigned',
                    'phone' => $ev['instructor_phone'] ?? '',
                    'avatar' => $ev['instructor_avatar'] ?? null,
                    'vehicle_rego' => $ev['vehicle_rego'] ?? ''
                ],
                'service_name' => $ev['service_name'],
                'transmission' => $ev['transmission'],
                'pickup_suburb' => $ev['pickup_suburb'],
                'pickup_address' => $ev['pickup_address'],
                'amount_aud' => (float)$ev['amount_aud'],
                'booking_status' => $ev['booking_status'],
                'payment_status' => $ev['payment_status']
            ];
        }, $events);

        Response::success($formatted, 'Calendar events retrieved');
    }

    public function checkSlotAvailability(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $instructorId = (int)($_GET['instructor_id'] ?? 0);
        $date = trim($_GET['date'] ?? '');
        $startTime = trim($_GET['start_time'] ?? '');
        $duration = (int)($_GET['duration_minutes'] ?? 60);

        if (!$instructorId || !$date || !$startTime) {
            Response::error('Instructor, date and start_time are required', 422);
        }

        $endTime = date('H:i:s', strtotime("{$startTime} + {$duration} minutes"));

        $stmt = $db->prepare("
            SELECT id, booking_code, start_time, end_time, booking_status 
            FROM bookings
            WHERE instructor_id = ? 
              AND lesson_date = ? 
              AND booking_status NOT IN ('cancelled')
              AND (
                (start_time <= ? AND end_time > ?) OR
                (start_time < ? AND end_time >= ?) OR
                (start_time >= ? AND end_time <= ?)
              )
            LIMIT 1
        ");
        $stmt->execute([
            $instructorId,
            $date,
            $startTime, $startTime,
            $endTime, $endTime,
            $startTime, $endTime
        ]);
        $conflict = $stmt->fetch();

        Response::success([
            'is_available' => !$conflict,
            'conflict' => $conflict ?: null
        ], $conflict ? 'Slot has conflicts' : 'Slot is completely available');
    }
}

