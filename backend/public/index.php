<?php
// backend/public/index.php

// Show all errors in dev
ini_set('display_errors', '1');
error_reporting(E_ALL);

// If using PHP built-in server router, serve existing static files directly
if (php_sapi_name() === 'cli-server') {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if ($path && $path !== '/' && file_exists(__DIR__ . $path)) {
        return false;
    }
}

require_once dirname(__DIR__) . '/middleware/CorsMiddleware.php';
CorsMiddleware::handle();

$router = require_once dirname(__DIR__) . '/routes/api.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

$router->dispatch($method, $uri);
