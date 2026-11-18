<?php
require_once dirname(__DIR__) . '/config/database.php';

$db = Database::getConnection();

// Add missing columns if they don't exist
$colsToAdd = [
    "publisher_name VARCHAR(150) NULL AFTER author_name",
    "seo_title VARCHAR(255) NULL AFTER status",
    "seo_description TEXT NULL AFTER seo_title",
    "image_url VARCHAR(500) NULL AFTER featured_image",
    "description TEXT NULL AFTER summary",
    "body LONGTEXT NULL AFTER content"
];

foreach ($colsToAdd as $colDef) {
    $colName = explode(' ', trim($colDef))[0];
    $exists = $db->query("SHOW COLUMNS FROM blogs LIKE '{$colName}'")->fetch();
    if (!$exists) {
        $db->exec("ALTER TABLE blogs ADD COLUMN {$colDef}");
        echo "Added column {$colName}\n";
    }
}

// Sync existing columns so data is populated
$db->exec("
    UPDATE blogs SET
        publisher_name = COALESCE(publisher_name, author_name, 'EZY 2 LEARN Team'),
        image_url = COALESCE(image_url, featured_image, 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'),
        description = COALESCE(description, summary, 'Driving lessons and tips from Sydney instructors.'),
        body = COALESCE(body, content, 'Full article content.'),
        seo_title = COALESCE(seo_title, CONCAT(title, ' | EZY 2 LEARN Driving School')),
        seo_description = COALESCE(seo_description, description)
");

echo "Blogs table migrated successfully!\n";

$rows = $db->query("SELECT id, title, category, publisher_name, status, created_at FROM blogs")->fetchAll(PDO::FETCH_ASSOC);
print_r($rows);
