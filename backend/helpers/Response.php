<?php
// backend/helpers/Response.php

class Response {
    public static function json($data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success($data = null, string $message = 'Success', int $statusCode = 200, array $meta = []): void {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data
        ];
        if (!empty($meta)) {
            $payload['meta'] = $meta;
        }
        self::json($payload, $statusCode);
    }

    public static function error(string $message = 'An error occurred', int $statusCode = 400, $errors = null): void {
        $payload = [
            'success' => false,
            'message' => $message
        ];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        self::json($payload, $statusCode);
    }

    public static function paginate(array $items, int $total, int $page, int $limit, string $message = 'Success', array $extra = []): void {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $items,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / max(1, $limit))
            ]
        ];
        foreach ($extra as $key => $val) {
            $payload[$key] = $val;
        }
        self::json($payload);
    }
}

