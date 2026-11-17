<?php
// backend/controllers/ContentController.php
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/Response.php';
require_once dirname(__DIR__) . '/helpers/Validator.php';
require_once dirname(__DIR__) . '/middleware/AuthMiddleware.php';

class ContentController {
    // 1. Pages (Homepage, About, etc.)
    public function getPage(string $key): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare("SELECT * FROM website_pages WHERE page_key = ?");
        $stmt->execute([$key]);
        $page = $stmt->fetch();

        if ($page) {
            $page['sections'] = json_decode($page['sections_json'], true);
            Response::success($page, 'Page content retrieved');
        } else {
            Response::error('Page not found', 404);
        }
    }

    public function updatePage(string $key): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $sectionsJson = json_encode($input['sections'] ?? []);

        $stmt = $db->prepare("
            UPDATE website_pages SET
                title = COALESCE(?, title),
                meta_description = COALESCE(?, meta_description),
                sections_json = ?
            WHERE page_key = ?
        ");
        $stmt->execute([
            $input['title'] ?? null,
            $input['meta_description'] ?? null,
            $sectionsJson,
            $key
        ]);

        Response::success(null, 'Page updated successfully');
    }

    // 2. FAQs
    public function getFaqs(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $faqs = $db->query("SELECT * FROM faqs ORDER BY sort_order ASC, id ASC")->fetchAll();
        Response::success($faqs, 'FAQs retrieved');
    }

    public function storeFaq(): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO faqs (category, question, answer, sort_order, is_published)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['category'] ?? 'General',
            $input['question'],
            $input['answer'],
            (int)($input['sort_order'] ?? 0),
            isset($input['is_published']) ? (int)$input['is_published'] : 1
        ]);
        Response::success(['id' => $db->lastInsertId()], 'FAQ created', 201);
    }

    public function updateFaq(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE faqs SET
                category = COALESCE(?, category),
                question = COALESCE(?, question),
                answer = COALESCE(?, answer),
                sort_order = COALESCE(?, sort_order),
                is_published = COALESCE(?, is_published)
            WHERE id = ?
        ");
        $stmt->execute([
            $input['category'] ?? null,
            $input['question'] ?? null,
            $input['answer'] ?? null,
            $input['sort_order'] ?? null,
            $input['is_published'] ?? null,
            $id
        ]);
        Response::success(null, 'FAQ updated');
    }

    public function deleteFaq(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor']);
        $db = Database::getConnection();
        $db->prepare("DELETE FROM faqs WHERE id = ?")->execute([$id]);
        Response::success(null, 'FAQ deleted');
    }

    // 3. Blogs
    public function getBlogs(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $blogs = $db->query("SELECT * FROM blogs ORDER BY id DESC")->fetchAll();
        Response::success($blogs, 'Blogs retrieved');
    }

    public function storeBlog(): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['title']))) . '-' . rand(10, 99);

        $stmt = $db->prepare("
            INSERT INTO blogs (title, slug, featured_image, author_name, category, summary, content, status, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $publishedAt = ($input['status'] ?? 'published') === 'published' ? date('Y-m-d H:i:s') : null;

        $stmt->execute([
            $input['title'],
            $slug,
            $input['featured_image'] ?? 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
            $input['author_name'] ?? 'EZY 2 LEARN Driving Team',
            $input['category'] ?? 'Driving Tips',
            $input['summary'] ?? null,
            $input['content'],
            $input['status'] ?? 'published',
            $publishedAt
        ]);

        Response::success(['id' => $db->lastInsertId()], 'Blog published', 201);
    }

    public function updateBlog(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            UPDATE blogs SET
                title = COALESCE(?, title),
                featured_image = COALESCE(?, featured_image),
                author_name = COALESCE(?, author_name),
                category = COALESCE(?, category),
                summary = COALESCE(?, summary),
                content = COALESCE(?, content),
                status = COALESCE(?, status)
            WHERE id = ?
        ");
        $stmt->execute([
            $input['title'] ?? null,
            $input['featured_image'] ?? null,
            $input['author_name'] ?? null,
            $input['category'] ?? null,
            $input['summary'] ?? null,
            $input['content'] ?? null,
            $input['status'] ?? null,
            $id
        ]);
        Response::success(null, 'Blog updated');
    }

    public function deleteBlog(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor']);
        $db = Database::getConnection();
        $db->prepare("DELETE FROM blogs WHERE id = ?")->execute([$id]);
        Response::success(null, 'Blog deleted');
    }

    // 4. Gallery
    public function getGallery(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $items = $db->query("SELECT * FROM gallery ORDER BY sort_order ASC, id DESC")->fetchAll();
        Response::success($items, 'Gallery retrieved');
    }

    public function storeGallery(): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor']);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        $stmt = $db->prepare("
            INSERT INTO gallery (title, image_url, caption, category, is_published, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['title'],
            $input['image_url'],
            $input['caption'] ?? null,
            $input['category'] ?? 'student_passes',
            isset($input['is_published']) ? (int)$input['is_published'] : 1,
            (int)($input['sort_order'] ?? 0)
        ]);

        Response::success(['id' => $db->lastInsertId()], 'Gallery item added', 201);
    }

    public function deleteGallery(int $id): void {
        AuthMiddleware::checkRole(['super_admin', 'content_editor']);
        $db = Database::getConnection();
        $db->prepare("DELETE FROM gallery WHERE id = ?")->execute([$id]);
        Response::success(null, 'Gallery image deleted');
    }
}

