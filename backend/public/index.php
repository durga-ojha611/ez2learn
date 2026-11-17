<?php
// backend/public/index.php

// Show all errors in dev
ini_set('display_errors', '1');
error_reporting(E_ALL);

require_once dirname(__DIR__) . '/middleware/CorsMiddleware.php';
CorsMiddleware::handle();

$router = require_once dirname(__DIR__) . '/routes/api.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

$router->dispatch($method, $uri);

