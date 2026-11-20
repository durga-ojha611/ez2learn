FROM php:8.2-cli

# Install PDO MySQL extensions
RUN docker-php-ext-install pdo pdo_mysql

WORKDIR /var/www/html

# Copy backend files
COPY . .

# Render exposes the port in the $PORT environment variable (default 10000)
EXPOSE 10000

ENV PORT=10000

# Start PHP built-in web server binding to 0.0.0.0 and routing through public/index.php
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public public/index.php"]
