<?php
// backend/controllers/PaymentController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class PaymentController {
    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 15)));
        $offset = ($page - 1) * $limit;

        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $method = trim($_GET['payment_method'] ?? '');
        $startDate = trim($_GET['start_date'] ?? '');
        $endDate = trim($_GET['end_date'] ?? '');

        $where = ['1=1'];
        $params = [];

        if ($search !== '') {
            $where[] = '(p.transaction_id LIKE ? OR s.name LIKE ? OR s.email LIKE ? OR b.booking_code LIKE ?)';
            $searchWild = "%{$search}%";
            $params[] = $searchWild;
            $params[] = $searchWild;
            $params[] = $searchWild;
            $params[] = $searchWild;
        }

        if ($status !== '' && $status !== 'all') {
            $where[] = 'p.payment_status = ?';
            $params[] = $status;
        }

        if ($method !== '' && $method !== 'all') {
            $where[] = 'p.payment_method = ?';
            $params[] = $method;
        }

        if ($startDate !== '') {
            $where[] = 'p.paid_at >= ?';
            $params[] = $startDate;
        }

        if ($endDate !== '') {
            $where[] = 'p.paid_at <= ?';
            $params[] = $endDate;
        }

        $whereSql = implode(' AND ', $where);

        $countStmt = $db->prepare("
            SELECT COUNT(*) FROM payments p
            JOIN students s ON p.student_id = s.id
            JOIN bookings b ON p.booking_id = b.id
            WHERE {$whereSql}
        ");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql = "
            SELECT p.*,
                   s.name as student_name, s.email as student_email, s.phone as student_phone,
                   b.booking_code, b.lesson_date, b.pickup_suburb,
                   srv.name as service_name
            FROM payments p
            JOIN students s ON p.student_id = s.id
            JOIN bookings b ON p.booking_id = b.id
            LEFT JOIN services srv ON b.service_id = srv.id
            WHERE {$whereSql}
            ORDER BY p.id DESC
            LIMIT {$limit} OFFSET {$offset}
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $payments = $stmt->fetchAll();

        // Summary Stats
        $stats = [
            'total_revenue' => (float)$db->query("SELECT COALESCE(SUM(amount_aud), 0) FROM payments WHERE payment_status = 'paid'")->fetchColumn(),
            'paid_amount' => (float)$db->query("SELECT COALESCE(SUM(amount_aud), 0) FROM payments WHERE payment_status = 'paid'")->fetchColumn(),
            'pending_amount' => (float)$db->query("SELECT COALESCE(SUM(amount_aud), 0) FROM bookings WHERE payment_status = 'pending'")->fetchColumn(),
            'refunded_amount' => (float)$db->query("SELECT COALESCE(SUM(refund_amount), 0) FROM payments WHERE payment_status = 'refunded'")->fetchColumn()
        ];

        Response::json([
            'success' => true,
            'data' => $payments,
            'stats' => $stats,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / max(1, $limit))
            ]
        ]);
    }

    public function refund(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'booking_manager']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $reason = $input['reason'] ?? 'Customer request within cancellation policy';

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM payments WHERE id = ?");
        $stmt->execute([$id]);
        $payment = $stmt->fetch();

        if (!$payment) {
            Response::error('Payment record not found', 404);
        }

        if ($payment['payment_status'] === 'refunded') {
            Response::error('Payment has already been refunded.', 400);
        }

        $refundAmount = !empty($input['refund_amount']) ? (float)$input['refund_amount'] : (float)$payment['amount_aud'];

        $db->prepare("
            UPDATE payments SET
                payment_status = 'refunded',
                refund_amount = ?,
                refund_reason = ?
            WHERE id = ?
        ")->execute([$refundAmount, $reason, $id]);

        // Update corresponding booking payment status
        $db->prepare("UPDATE bookings SET payment_status = 'refunded' WHERE id = ?")->execute([$payment['booking_id']]);

        Response::success(null, "Refund of \${$refundAmount} AUD processed successfully");
    }

    public function updateStatus(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'booking_manager']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = strtolower(trim($input['status'] ?? 'paid'));
        $validStatuses = ['paid', 'pending', 'failed', 'refunded'];
        if (!in_array($status, $validStatuses)) {
            Response::error('Invalid payment status', 400);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM payments WHERE id = ?");
        $stmt->execute([$id]);
        $payment = $stmt->fetch();

        if (!$payment) {
            Response::error('Payment record not found', 404);
        }

        $db->prepare("UPDATE payments SET payment_status = ? WHERE id = ?")->execute([$status, $id]);
        $db->prepare("UPDATE bookings SET payment_status = ? WHERE id = ?")->execute([$status, $payment['booking_id']]);

        Response::success(null, "Payment status updated to " . ucfirst($status));
    }

    public function exportCsv(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $payments = $db->query("
            SELECT p.transaction_id, s.name as student_name, b.booking_code,
                   p.amount_aud, p.payment_method, p.payment_status, p.receipt_number,
                   p.refund_amount, p.refund_reason, p.paid_at
            FROM payments p
            JOIN students s ON p.student_id = s.id
            JOIN bookings b ON p.booking_id = b.id
            ORDER BY p.id DESC
        ")->fetchAll();

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=payments_export_' . date('Y-m-d') . '.csv');

        $output = fopen('php://output', 'w');
        fputcsv($output, ['Transaction ID', 'Student', 'Booking Code', 'Amount (AUD)', 'Payment Method', 'Status', 'Receipt Number', 'Refund (AUD)', 'Refund Reason', 'Paid Date']);

        foreach ($payments as $row) {
            fputcsv($output, [
                $row['transaction_id'],
                $row['student_name'],
                $row['booking_code'],
                $row['amount_aud'],
                strtoupper(str_replace('_', ' ', $row['payment_method'])),
                ucfirst($row['payment_status']),
                $row['receipt_number'],
                $row['refund_amount'],
                $row['refund_reason'] ?? '',
                $row['paid_at']
            ]);
        }
        fclose($output);
        exit;
    }
}

