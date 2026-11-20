const fs = require('fs');
const path = require('path');
const http = require('http');

const targetDir = path.join(__dirname, 'NETLIFY_DEPLOY_FOLDER');

// Ensure target dir exists
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// Copy frontend/.next/static to NETLIFY_DEPLOY_FOLDER/_next/static
const nextStaticSrc = path.join(__dirname, 'frontend', '.next', 'static');
const nextStaticDest = path.join(targetDir, '_next', 'static');
if (fs.existsSync(nextStaticSrc)) {
  fs.cpSync(nextStaticSrc, nextStaticDest, { recursive: true });
  console.log('✓ Copied .next/static to _next/static');
}

// Copy frontend/public to NETLIFY_DEPLOY_FOLDER
const publicSrc = path.join(__dirname, 'frontend', 'public');
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, targetDir, { recursive: true });
  console.log('✓ Copied frontend/public files');
}

// Copy mock data into static API endpoints
const mockDataPath = path.join(__dirname, 'frontend', 'lib', 'mockData.json');
if (fs.existsSync(mockDataPath)) {
  const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
  for (const [endpoint, data] of Object.entries(mockData)) {
    // endpoint e.g. /api/dashboard/overview
    const cleanPath = endpoint.replace(/^\//, ''); // api/dashboard/overview
    const destDir = path.join(targetDir, cleanPath);
    fs.mkdirSync(destDir, { recursive: true });
    // Write both index.json and index.html (containing JSON string)
    fs.writeFileSync(path.join(destDir, 'index.json'), JSON.stringify(data), 'utf8');
    fs.writeFileSync(path.join(destDir, 'index.html'), JSON.stringify(data), 'utf8');
  }
  console.log(`✓ Generated ${Object.keys(mockData).length} static API endpoints in /api`);
}

// Create _redirects for Netlify SPA routing
const redirectsContent = `
/admin /dashboard 301
/api/dashboard/overview /api/dashboard/overview/index.json 200
/api/bookings /api/bookings/index.json 200
/api/instructors /api/instructors/index.json 200
/api/inquiries /api/inquiries/index.json 200
/api/services /api/services/index.json 200
/api/reviews /api/reviews/index.json 200
/api/calendar/events /api/calendar/events/index.json 200
/api/content/page/homepage /api/content/page/homepage/index.json 200
/api/notifications /api/notifications/index.json 200
/api/reports/analytics /api/reports/analytics/index.json 200
/api/settings /api/settings/index.json 200
/api/students /api/students/index.json 200
/api/locations /api/locations/index.json 200
/api/subadmins /api/subadmins/index.json 200
/api/blogs /api/blogs/index.json 200
/* /index.html 200
`.trim() + '\n';

fs.writeFileSync(path.join(targetDir, '_redirects'), redirectsContent);
console.log('✓ Created Netlify _redirects file');

// Helper to fetch url
function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Pages to export
const pages = [
  '/',
  '/driving-lessons',
  '/book',
  '/our-instructors',
  '/our-instructors/1',
  '/our-instructors/1/book',
  '/our-instructors/1/availability',
  '/our-instructors/2',
  '/our-instructors/2/book',
  '/our-instructors/2/availability',
  '/our-instructors/3',
  '/our-instructors/3/book',
  '/our-instructors/3/availability',
  '/our-instructors/4',
  '/our-instructors/4/book',
  '/our-instructors/4/availability',
  '/dashboard',
  '/bookings',
  '/bookings/1',
  '/inquiries',
  '/instructors',
  '/instructors/1',
  '/students',
  '/calendar',
  '/services',
  '/payments',
  '/locations',
  '/reviews',
  '/blogs',
  '/cms',
  '/reports',
  '/settings',
  '/login'
];

async function runExport() {
  console.log(`Starting export of ${pages.length} pages from http://localhost:3000...`);
  for (const pagePath of pages) {
    try {
      const html = await fetchUrl(pagePath);
      let filePath;
      if (pagePath === '/') {
        filePath = path.join(targetDir, 'index.html');
      } else {
        const pageSubDir = path.join(targetDir, pagePath);
        fs.mkdirSync(pageSubDir, { recursive: true });
        filePath = path.join(pageSubDir, 'index.html');
      }
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`✓ Exported: ${pagePath} -> ${filePath.replace(__dirname, '')}`);
    } catch (err) {
      console.error(`✗ Error exporting ${pagePath}:`, err.message);
    }
  }

  // Copy dashboard to admin/index.html
  const dashPath = path.join(targetDir, 'dashboard', 'index.html');
  if (fs.existsSync(dashPath)) {
    const adminDir = path.join(targetDir, 'admin');
    fs.mkdirSync(adminDir, { recursive: true });
    fs.copyFileSync(dashPath, path.join(adminDir, 'index.html'));
    console.log('✓ Created /admin shortcut -> dashboard');
  }

  // Copy index.html to 404.html
  const indexPath = path.join(targetDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join(targetDir, '404.html'));
    console.log('✓ Created 404.html fallback');
  }

  console.log('\n========================================');
  console.log('🎉 SUCCESS! NETLIFY DEPLOY FOLDER READY:');
  console.log(targetDir);
  console.log('========================================');
}

runExport();
