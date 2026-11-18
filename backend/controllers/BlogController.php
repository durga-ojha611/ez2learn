<?php
// backend/controllers/BlogController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class BlogController {
    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $search = $_GET['search'] ?? '';
        $category = $_GET['category'] ?? '';
        $status = $_GET['status'] ?? '';

        $sql = "SELECT * FROM blogs WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (title LIKE ? OR publisher_name LIKE ? OR author_name LIKE ? OR description LIKE ?)";
            $searchTerm = "%{$search}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($category) && $category !== 'all') {
            $sql .= " AND category = ?";
            $params[] = $category;
        }

        if (!empty($status) && $status !== 'all') {
            $sql .= " AND status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY id DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Normalize fields for frontend
        foreach ($blogs as &$b) {
            $b['publisher_name'] = $b['publisher_name'] ?: $b['author_name'] ?: 'EZY 2 LEARN Team';
            $b['image_url'] = $b['image_url'] ?: $b['featured_image'] ?: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800';
            $b['description'] = $b['description'] ?: $b['summary'] ?: '';
            $b['body'] = $b['body'] ?: $b['content'] ?: '';
            $b['seo_title'] = $b['seo_title'] ?: $b['title'];
            $b['seo_description'] = $b['seo_description'] ?: $b['description'];
        }

        // Stats
        $stats = [
            'total' => (int)$db->query("SELECT COUNT(*) FROM blogs")->fetchColumn(),
            'published' => (int)$db->query("SELECT COUNT(*) FROM blogs WHERE status = 'published'")->fetchColumn(),
            'draft' => (int)$db->query("SELECT COUNT(*) FROM blogs WHERE status = 'draft'")->fetchColumn(),
            'total_views' => (int)$db->query("SELECT COALESCE(SUM(views_count), 0) FROM blogs")->fetchColumn(),
        ];

        Response::success([
            'blogs' => $blogs,
            'stats' => $stats
        ], 'Blogs retrieved successfully');
    }

    public function show(int $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare("SELECT * FROM blogs WHERE id = ?");
        $stmt->execute([$id]);
        $blog = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$blog) {
            Response::error('Blog not found', 404);
        }

        $blog['publisher_name'] = $blog['publisher_name'] ?: $blog['author_name'] ?: 'EZY 2 LEARN Team';
        $blog['image_url'] = $blog['image_url'] ?: $blog['featured_image'] ?: '';
        $blog['description'] = $blog['description'] ?: $blog['summary'] ?: '';
        $blog['body'] = $blog['body'] ?: $blog['content'] ?: '';
        $blog['seo_title'] = $blog['seo_title'] ?: $blog['title'];
        $blog['seo_description'] = $blog['seo_description'] ?: $blog['description'];

        Response::success($blog, 'Blog retrieved');
    }

    public function store(): void {
        AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator($input);
        if (!$validator->validate([
            'title' => 'required',
            'category' => 'required',
            'description' => 'required',
            'body' => 'required',
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $db = Database::getConnection();
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['title']))) . '-' . rand(100, 999);

        $imageUrl = !empty($input['image_url']) ? $input['image_url'] : 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800';
        $publisher = !empty($input['publisher_name']) ? $input['publisher_name'] : 'EZY 2 LEARN Team';
        $status = in_array($input['status'] ?? '', ['published', 'draft']) ? $input['status'] : 'published';
        $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;

        $stmt = $db->prepare("
            INSERT INTO blogs (
                title, slug, category, image_url, featured_image,
                description, summary, body, content,
                publisher_name, author_name,
                seo_title, seo_description,
                status, views_count, published_at
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?,
                ?, ?,
                ?, ?, ?
            )
        ");

        $stmt->execute([
            $input['title'],
            $slug,
            $input['category'],
            $imageUrl,
            $imageUrl,
            $input['description'],
            $input['description'],
            $input['body'],
            $input['body'],
            $publisher,
            $publisher,
            $input['seo_title'] ?? $input['title'],
            $input['seo_description'] ?? $input['description'],
            $status,
            0,
            $publishedAt
        ]);

        Response::success(['id' => $db->lastInsertId()], 'Blog created successfully', 201);
    }

    public function update(int $id): void {
        AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $imageUrl = $input['image_url'] ?? null;
        $publisher = $input['publisher_name'] ?? null;
        $desc = $input['description'] ?? null;
        $body = $input['body'] ?? null;

        $stmt = $db->prepare("
            UPDATE blogs SET
                title = COALESCE(?, title),
                category = COALESCE(?, category),
                image_url = COALESCE(?, image_url),
                featured_image = COALESCE(?, featured_image),
                description = COALESCE(?, description),
                summary = COALESCE(?, summary),
                body = COALESCE(?, body),
                content = COALESCE(?, content),
                publisher_name = COALESCE(?, publisher_name),
                author_name = COALESCE(?, author_name),
                seo_title = COALESCE(?, seo_title),
                seo_description = COALESCE(?, seo_description),
                status = COALESCE(?, status)
            WHERE id = ?
        ");

        $stmt->execute([
            $input['title'] ?? null,
            $input['category'] ?? null,
            $imageUrl,
            $imageUrl,
            $desc,
            $desc,
            $body,
            $body,
            $publisher,
            $publisher,
            $input['seo_title'] ?? null,
            $input['seo_description'] ?? null,
            $input['status'] ?? null,
            $id
        ]);

        Response::success(null, 'Blog updated successfully');
    }

    public function delete(int $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $db->prepare("DELETE FROM blogs WHERE id = ?")->execute([$id]);
        Response::success(null, 'Blog deleted');
    }
}
