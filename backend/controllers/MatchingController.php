<?php
// backend/controllers/MatchingController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class MatchingController {
    public function match(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $suburb = trim($_GET['suburb'] ?? '');
        $postcode = trim($_GET['postcode'] ?? '');
        $transmission = trim($_GET['transmission'] ?? 'automatic');
        $gender = trim($_GET['gender'] ?? 'any');
        $maxRate = !empty($_GET['max_rate']) ? (float)$_GET['max_rate'] : null;
        $lessonDate = trim($_GET['lesson_date'] ?? '');
        $startTime = trim($_GET['start_time'] ?? '');
        $duration = (int)($_GET['duration_minutes'] ?? 60);

        // Fetch all active instructors
        $instructors = $db->query("
            SELECT i.*,
                   (
                       SELECT GROUP_CONCAT(s.name SEPARATOR ', ')
                       FROM instructor_service_areas isa
                       JOIN suburbs s ON isa.suburb_id = s.id
                       WHERE isa.instructor_id = i.id
                   ) as covered_suburbs,
                   (
                       SELECT GROUP_CONCAT(s.postcode SEPARATOR ', ')
                       FROM instructor_service_areas isa
                       JOIN suburbs s ON isa.suburb_id = s.id
                       WHERE isa.instructor_id = i.id
                   ) as covered_postcodes
            FROM instructors i
            WHERE i.status = 'active'
        ")->fetchAll();

        $results = [];

        foreach ($instructors as $inst) {
            $score = 50; // base score
            $matchReasons = [];
            $unavailabilityReason = null;

            // 1. Transmission check
            if ($transmission !== 'any') {
                if ($inst['transmission'] === $transmission || $inst['transmission'] === 'both') {
                    $score += 25;
                    $matchReasons[] = ucfirst($transmission) . ' transmission supported';
                } else {
                    // Transmission mismatch -> disqualify
                    continue;
                }
            }

            // 2. Gender preference check
            if ($gender !== 'any' && !empty($gender)) {
                if ($inst['gender'] === $gender) {
                    $score += 10;
                    $matchReasons[] = ucfirst($gender) . ' instructor requested';
                } else {
                    $score -= 15;
                }
            }

            // 3. Hourly rate filter
            if ($maxRate !== null && (float)$inst['hourly_rate'] > $maxRate) {
                continue;
            }

            // 4. Suburb / Postcode coverage check
            $coveredSuburbs = array_map('trim', explode(',', strtolower($inst['covered_suburbs'] ?? '')));
            $coveredPostcodes = array_map('trim', explode(',', $inst['covered_postcodes'] ?? ''));

            $areaCovered = false;
            if (!empty($suburb) && in_array(strtolower($suburb), $coveredSuburbs)) {
                $areaCovered = true;
                $score += 20;
                $matchReasons[] = "Covers {$suburb} directly";
            }
            if (!empty($postcode) && in_array($postcode, $coveredPostcodes)) {
                $areaCovered = true;
                $score += 15;
                $matchReasons[] = "Covers postcode {$postcode}";
            }

            // 5. Availability conflict check
            $isAvailable = true;
            if (!empty($lessonDate) && !empty($startTime)) {
                $endTime = date('H:i:s', strtotime("{$startTime} + {$duration} minutes"));

                // Check conflict against existing bookings
                $conflictStmt = $db->prepare("
                    SELECT id FROM bookings
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
                $conflictStmt->execute([
                    $inst['id'],
                    $lessonDate,
                    $startTime, $startTime,
                    $endTime, $endTime,
                    $startTime, $endTime
                ]);

                if ($conflictStmt->fetch()) {
                    $isAvailable = false;
                    $unavailabilityReason = "Already booked at {$startTime} on {$lessonDate}";
                }
            }

            // Bonus for high ratings and experience
            $score += min(15, (float)$inst['rating'] * 2.5);
            $score += min(10, (int)$inst['experience_years']);

            $results[] = [
                'instructor_id' => $inst['id'],
                'name' => $inst['name'],
                'avatar_url' => $inst['avatar_url'],
                'rating' => (float)$inst['rating'],
                'total_reviews' => (int)$inst['total_reviews'],
                'experience_years' => (int)$inst['experience_years'],
                'transmission' => $inst['transmission'],
                'gender' => $inst['gender'],
                'hourly_rate' => (float)$inst['hourly_rate'],
                'vehicle' => "{$inst['vehicle_year']} {$inst['vehicle_make']} {$inst['vehicle_model']}",
                'vehicle_rego' => $inst['vehicle_rego'],
                'is_dual_control' => (bool)$inst['is_dual_control'],
                'covered_suburbs' => $inst['covered_suburbs'],
                'is_area_covered' => $areaCovered,
                'is_available' => $isAvailable,
                'unavailability_reason' => $unavailabilityReason,
                'next_available_slot' => $isAvailable ? ($lessonDate ? "{$lessonDate} at {$startTime}" : 'Tomorrow 9:00 AM') : 'Next available in 2 days',
                'match_score' => min(100, max(10, (int)$score)),
                'match_reasons' => $matchReasons
            ];
        }

        // Sort by match score descending, then availability
        usort($results, function ($a, $b) {
            if ($a['is_available'] !== $b['is_available']) {
                return $b['is_available'] ? 1 : -1;
            }
            return $b['match_score'] <=> $a['match_score'];
        });

        Response::success([
            'criteria' => [
                'suburb' => $suburb,
                'postcode' => $postcode,
                'transmission' => $transmission,
                'gender' => $gender,
                'lesson_date' => $lessonDate,
                'start_time' => $startTime
            ],
            'total_matches' => count($results),
            'instructors' => $results
        ], 'Matching results calculated successfully');
    }
}

