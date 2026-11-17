<?php
// backend/config/app.php

return [
    'name' => 'EZY 2 LEARN Driving School Admin API',
    'version' => '1.0.0',
    'env' => getenv('APP_ENV') ?: 'development',
    'jwt_secret' => getenv('JWT_SECRET') ?: 'ezy2learn_super_secure_jwt_secret_sydney_2026',
    'base_url' => getenv('APP_URL') ?: 'http://127.0.0.1:8000',
    'frontend_url' => getenv('FRONTEND_URL') ?: 'http://localhost:3000',
    'upload_dir' => dirname(__DIR__) . '/storage/uploads',
];

