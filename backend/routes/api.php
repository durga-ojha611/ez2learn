<?php
// backend/routes/api.php

class Router {
    private array $routes = [];

    public function add(string $method, string $pattern, string $controllerAction): void {
        $this->routes[] = [
            'method' => strtoupper($method),
            'pattern' => $pattern,
            'controllerAction' => $controllerAction
        ];
    }

    public function get(string $pattern, string $controllerAction): void {
        $this->add('GET', $pattern, $controllerAction);
    }

    public function post(string $pattern, string $controllerAction): void {
        $this->add('POST', $pattern, $controllerAction);
    }

    public function put(string $pattern, string $controllerAction): void {
        $this->add('PUT', $pattern, $controllerAction);
    }

    public function patch(string $pattern, string $controllerAction): void {
        $this->add('PATCH', $pattern, $controllerAction);
    }

    public function delete(string $pattern, string $controllerAction): void {
        $this->add('DELETE', $pattern, $controllerAction);
    }

    public function dispatch(string $method, string $uri): void {
        $path = parse_url($uri, PHP_URL_PATH);
        // Normalize leading and trailing slashes
        $path = '/' . trim($path, '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            // Convert pattern with {param} to regex
            $regex = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $route['pattern']);
            $regex = '#^/' . trim($regex, '/') . '$#';

            if (preg_match($regex, $path, $matches)) {
                $params = [];
                foreach ($matches as $key => $val) {
                    if (is_string($key)) {
                        $params[$key] = $val;
                    }
                }

                [$controllerName, $action] = explode('@', $route['controllerAction']);
                $controllerFile = dirname(__DIR__) . "/controllers/{$controllerName}.php";

                if (file_exists($controllerFile)) {
                    require_once $controllerFile;
                    $controller = new $controllerName();
                    if (method_exists($controller, $action)) {
                        call_user_func_array([$controller, $action], array_values($params));
                        return;
                    }
                }
            }
        }

        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => "Route not found: [{$method}] {$path}"
        ]);
        exit;
    }
}

$router = new Router();

// --- Authentication ---
$router->post('/api/auth/login', 'AuthController@login');
$router->post('/api/auth/logout', 'AuthController@logout');
$router->get('/api/auth/me', 'AuthController@me');
$router->post('/api/auth/password', 'AuthController@updatePassword');

// --- Dashboard ---
$router->get('/api/dashboard/overview', 'DashboardController@getOverview');

// --- Bookings ---
$router->get('/api/bookings', 'BookingController@index');
$router->get('/api/bookings/{id}', 'BookingController@show');
$router->post('/api/bookings', 'BookingController@store');
$router->put('/api/bookings/{id}', 'BookingController@update');
$router->patch('/api/bookings/{id}/status', 'BookingController@updateStatus');
$router->patch('/api/bookings/{id}/assign', 'BookingController@assignInstructor');
$router->patch('/api/bookings/{id}/reschedule', 'BookingController@reschedule');
$router->post('/api/bookings/{id}/refund', 'BookingController@refund');
$router->delete('/api/bookings/{id}', 'BookingController@delete');

// --- Instructors ---
$router->get('/api/instructors', 'InstructorController@index');
$router->get('/api/instructors/{id}', 'InstructorController@show');
$router->post('/api/instructors', 'InstructorController@store');
$router->put('/api/instructors/{id}', 'InstructorController@update');
$router->patch('/api/instructors/{id}/status', 'InstructorController@updateStatus');
$router->delete('/api/instructors/{id}', 'InstructorController@delete');

// --- Students ---
$router->get('/api/students', 'StudentController@index');
$router->get('/api/students/{id}', 'StudentController@show');
$router->post('/api/students', 'StudentController@store');
$router->put('/api/students/{id}', 'StudentController@update');
$router->delete('/api/students/{id}', 'StudentController@delete');

// --- Matching ---
$router->get('/api/matching', 'MatchingController@match');

// --- Schedule & Calendar ---
$router->get('/api/calendar/events', 'CalendarController@getEvents');
$router->get('/api/calendar/check-availability', 'CalendarController@checkSlotAvailability');

// --- Services & Packages ---
$router->get('/api/services', 'ServiceController@index');
$router->post('/api/services', 'ServiceController@storeService');
$router->put('/api/services/{id}', 'ServiceController@updateService');
$router->delete('/api/services/{id}', 'ServiceController@deleteService');
$router->post('/api/packages', 'ServiceController@storePackage');
$router->put('/api/packages/{id}', 'ServiceController@updatePackage');
$router->delete('/api/packages/{id}', 'ServiceController@deletePackage');

// --- Payments ---
$router->get('/api/payments', 'PaymentController@index');
$router->post('/api/payments/{id}/refund', 'PaymentController@refund');
$router->patch('/api/payments/{id}/status', 'PaymentController@updateStatus');
$router->get('/api/payments/export', 'PaymentController@exportCsv');

// --- Locations ---
$router->get('/api/locations', 'LocationController@index');
$router->get('/api/locations/{id}/instructors', 'LocationController@getInstructorsBySuburb');
$router->post('/api/locations/suburbs', 'LocationController@storeSuburb');
$router->put('/api/locations/suburbs/{id}', 'LocationController@updateSuburb');
$router->patch('/api/locations/suburbs/{id}/toggle', 'LocationController@toggleStatus');
$router->delete('/api/locations/suburbs/{id}', 'LocationController@deleteSuburb');

// --- Reviews ---
$router->get('/api/reviews', 'ReviewController@index');
$router->post('/api/reviews/{id}/reply', 'ReviewController@reply');
$router->patch('/api/reviews/{id}/status', 'ReviewController@updateStatus');
$router->patch('/api/reviews/{id}/feature', 'ReviewController@toggleFeatured');
$router->delete('/api/reviews/{id}', 'ReviewController@delete');

// --- Website Content CMS ---
$router->get('/api/content/pages', 'ContentController@getPages');
$router->get('/api/content/page/{key}', 'ContentController@getPage');
$router->put('/api/content/page/{key}', 'ContentController@updatePage');
$router->get('/api/content/faqs', 'ContentController@getFaqs');
$router->post('/api/content/faqs', 'ContentController@storeFaq');
$router->put('/api/content/faqs/{id}', 'ContentController@updateFaq');
$router->delete('/api/content/faqs/{id}', 'ContentController@deleteFaq');
$router->get('/api/content/blogs', 'ContentController@getBlogs');
$router->post('/api/content/blogs', 'ContentController@storeBlog');
$router->put('/api/content/blogs/{id}', 'ContentController@updateBlog');
$router->delete('/api/content/blogs/{id}', 'ContentController@deleteBlog');
$router->get('/api/content/gallery', 'ContentController@getGallery');
$router->post('/api/content/gallery', 'ContentController@storeGallery');
$router->delete('/api/content/gallery/{id}', 'ContentController@deleteGallery');

// --- Blogs Dedicated Module ---
$router->get('/api/blogs', 'BlogController@index');
$router->get('/api/blogs/{id}', 'BlogController@show');
$router->post('/api/blogs', 'BlogController@store');
$router->put('/api/blogs/{id}', 'BlogController@update');
$router->delete('/api/blogs/{id}', 'BlogController@delete');

// --- Inquiries & Student Leads ---
$router->get('/api/inquiries', 'InquiryController@index');
$router->get('/api/inquiries/{id}', 'InquiryController@show');
$router->post('/api/inquiries', 'InquiryController@store');
$router->put('/api/inquiries/{id}', 'InquiryController@update');
$router->post('/api/inquiries/{id}/reply', 'InquiryController@reply');
$router->delete('/api/inquiries/{id}', 'InquiryController@delete');

// --- Reports & Analytics ---
$router->get('/api/reports/analytics', 'ReportController@getAnalytics');
$router->get('/api/reports/export', 'ReportController@exportCsv');

// --- Notifications ---
$router->get('/api/notifications', 'NotificationController@index');
$router->patch('/api/notifications/{id}/read', 'NotificationController@markAsRead');
$router->post('/api/notifications/read-all', 'NotificationController@markAllAsRead');
$router->delete('/api/notifications/{id}', 'NotificationController@delete');

// --- Settings & Admin Users ---
$router->get('/api/settings', 'SettingsController@getSettings');
$router->put('/api/settings', 'SettingsController@updateSettings');
$router->get('/api/settings/users', 'SettingsController@getUsers');
$router->post('/api/settings/users', 'SettingsController@storeUser');
$router->put('/api/settings/users/{id}', 'SettingsController@updateUser');
$router->delete('/api/settings/users/{id}', 'SettingsController@deleteUser');
$router->post('/api/settings/role-permissions', 'SettingsController@updateRolePermissions');

// --- Sub-Admins & Sidebar Section Permissions ---
$router->get('/api/subadmins', 'SubAdminController@index');
$router->post('/api/subadmins', 'SubAdminController@store');
$router->put('/api/subadmins/{id}', 'SubAdminController@update');
$router->delete('/api/subadmins/{id}', 'SubAdminController@delete');
$router->get('/api/subadmins/activity', 'SubAdminController@activity');

return $router;

