const fs = require('fs');
const path = require('path');
const http = require('http');

const targetDir = path.join(__dirname, 'OUR_INSTRUCTORS_NETLIFY');

// Clean and recreate target directory
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

console.log('1. Setting up OUR_INSTRUCTORS_NETLIFY folder structure...');

// 1. Copy Next.js static assets (_next/static)
const nextStaticSrc = path.join(__dirname, 'frontend', '.next', 'static');
const nextStaticDest = path.join(targetDir, '_next', 'static');
if (fs.existsSync(nextStaticSrc)) {
  fs.cpSync(nextStaticSrc, nextStaticDest, { recursive: true });
  console.log('✓ Copied Next.js static assets to _next/static');
}

// 2. Copy frontend/public assets
const publicSrc = path.join(__dirname, 'frontend', 'public');
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, targetDir, { recursive: true });
  console.log('✓ Copied public assets (icons, images, logos)');
}

// Helper: fetch from local Next.js server
function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Helper: fetch JSON from local PHP backend
function fetchBackendJson(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:8000${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function exportPages() {
  console.log('\n2. Exporting HTML pages...');

  // The ROOT URL (/) should open the Instructors directory!
  try {
    const instructorsHtml = await fetchUrl('/our-instructors');
    fs.writeFileSync(path.join(targetDir, 'index.html'), instructorsHtml, 'utf8');
    fs.writeFileSync(path.join(targetDir, '404.html'), instructorsHtml, 'utf8');
    console.log('✓ Set / (root) and 404.html to Our Instructors page');
  } catch (err) {
    console.error('✗ Error fetching /our-instructors:', err.message);
  }

  // List of Instructor & Booking pages to export
  const pages = [
    '/driving-lessons',
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
    '/book'
  ];

  for (const pagePath of pages) {
    try {
      const html = await fetchUrl(pagePath);
      const pageSubDir = path.join(targetDir, pagePath);
      fs.mkdirSync(pageSubDir, { recursive: true });
      fs.writeFileSync(path.join(pageSubDir, 'index.html'), html, 'utf8');
      console.log(`✓ Exported: ${pagePath} -> ${pagePath}/index.html`);
    } catch (err) {
      console.error(`✗ Error exporting ${pagePath}:`, err.message);
    }
  }

  console.log('\n3. Generating static API mock endpoints for standalone Netlify hosting...');

  // Helper to write static endpoint
  function writeApiEndpoint(endpointPath, jsonContent) {
    const cleanPath = endpointPath.replace(/^\//, '');
    const dir = path.join(targetDir, cleanPath);
    fs.mkdirSync(dir, { recursive: true });
    const content = typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent, null, 2);
    fs.writeFileSync(path.join(dir, 'index.json'), content, 'utf8');
    fs.writeFileSync(path.join(dir, 'index.html'), content, 'utf8');
  }

  // A. Fetch or generate /api/instructors
  const instructorsLive = await fetchBackendJson('/api/instructors');
  const instructorsData = instructorsLive?.data || [
    {
      id: 1,
      name: "Kevin Kabir",
      initials: "KK",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
      title: "TFNSW Accredited Senior Instructor & Assessor",
      transmission: "Automatic",
      car: "Toyota Corolla Hybrid (Dual-Control)",
      suburbs: ["Parramatta", "Sydney CBD", "Blacktown", "Ryde"],
      languages: ["English", "Hindi", "Urdu", "Punjabi"],
      rating: 4.9,
      reviewCount: 284,
      hourlyRate: 75,
      nextAvailable: "Tue 24 Nov",
      verified: true,
      isPopular: true
    },
    {
      id: 2,
      name: "Priya Nair",
      initials: "PN",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      title: "Accredited Driving Instructor",
      transmission: "Automatic",
      car: "Kia Cerato (Dual-Control)",
      suburbs: ["Northside", "Chatswood", "Ryde", "Parramatta"],
      languages: ["English", "Hindi"],
      rating: 4.9,
      reviewCount: 196,
      hourlyRate: 70,
      nextAvailable: "Tue 24 Nov",
      verified: true
    },
    {
      id: 3,
      name: "Daniel Okafor",
      initials: "DO",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      title: "Dual-Control Specialist & Senior Assessor",
      transmission: "Both",
      car: "Toyota Corolla (Dual-Control)",
      suburbs: ["Blacktown", "Parramatta", "Penrith", "Castle Hill"],
      languages: ["English"],
      rating: 4.9,
      reviewCount: 154,
      hourlyRate: 75,
      nextAvailable: "Mon 23 Nov",
      verified: true
    },
    {
      id: 4,
      name: "Sofia Reyes",
      initials: "SR",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      title: "Patient Beginner Specialist",
      transmission: "Automatic",
      car: "Mazda 2 (Dual-Control)",
      suburbs: ["Liverpool", "Bankstown", "Parramatta", "Strathfield"],
      languages: ["English", "Spanish"],
      rating: 4.8,
      reviewCount: 128,
      hourlyRate: 70,
      nextAvailable: "Wed 25 Nov",
      verified: true
    }
  ];
  writeApiEndpoint('/api/instructors', {
    success: true,
    message: "Instructors list",
    data: instructorsData
  });
  console.log('✓ Generated /api/instructors endpoint');

  // B. Packages
  const packagesLive = await fetchBackendJson('/api/packages');
  const packagesData = packagesLive?.data || [
    {
      id: 1,
      package_code: "SINGLE",
      name: "Single Lesson",
      description: "Try one lesson",
      hours: 1,
      discount_percentage: 0,
      is_popular: 0
    },
    {
      id: 2,
      package_code: "STARTER",
      name: "6+ Hours",
      description: "Save 5%",
      hours: 6,
      discount_percentage: 5,
      is_popular: 0
    },
    {
      id: 3,
      package_code: "COMPLETE",
      name: "10+ Hours",
      description: "Save 10% · bonus logbook hours",
      hours: 10,
      discount_percentage: 10,
      is_popular: 1
    },
    {
      id: 4,
      package_code: "CUSTOM",
      name: "Custom Hours",
      description: "Choose your own amount",
      hours: 8,
      discount_percentage: 5,
      is_popular: 0
    }
  ];
  writeApiEndpoint('/api/packages', {
    success: true,
    message: "Packages list",
    data: packagesData
  });
  console.log('✓ Generated /api/packages endpoint');

  // C. Availability for instructors 1..4
  for (let instId = 1; instId <= 4; instId++) {
    const availLive = await fetchBackendJson(`/api/instructors/${instId}/availability?date=2026-11-26`);
    const availData = availLive?.data || {
      instructor_id: instId,
      date: "2026-11-26",
      slots: [
        { time: "08:00", available: true, status: "available" },
        { time: "09:30", available: false, status: "booked" },
        { time: "10:30", available: true, status: "available" },
        { time: "12:00", available: true, status: "available" },
        { time: "14:00", available: true, status: "available" },
        { time: "15:30", available: false, status: "booked" },
        { time: "17:00", available: true, status: "available" },
        { time: "18:30", available: true, status: "available" }
      ],
      available_dates: [
        "2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27", "2026-11-30"
      ]
    };
    writeApiEndpoint(`/api/instructors/${instId}/availability`, {
      success: true,
      message: "Availability retrieved",
      data: availData
    });
  }
  console.log('✓ Generated /api/instructors/:id/availability endpoints');

  // D. Promo validate & Bookings mock
  writeApiEndpoint('/api/promo/validate', {
    success: true,
    message: "Promo code validated successfully",
    data: {
      code: "EZY10",
      discount: 10,
      description: "$10 promotional discount applied"
    }
  });

  writeApiEndpoint('/api/bookings', {
    success: true,
    message: "Booking confirmed successfully",
    data: {
      booking_reference: "EZY-782914",
      amount_paid: 630.00,
      status: "confirmed"
    }
  });
  console.log('✓ Generated /api/promo/validate and /api/bookings endpoints');

  // 4. Create _redirects file for Netlify
  const redirectsContent = `
# API Endpoints
/api/instructors /api/instructors/index.json 200
/api/packages /api/packages/index.json 200
/api/instructors/1/availability /api/instructors/1/availability/index.json 200
/api/instructors/2/availability /api/instructors/2/availability/index.json 200
/api/instructors/3/availability /api/instructors/3/availability/index.json 200
/api/instructors/4/availability /api/instructors/4/availability/index.json 200
/api/promo/validate /api/promo/validate/index.json 200
/api/bookings /api/bookings/index.json 200

# Instructors root and booking funnel routing
/ /index.html 200
/our-instructors /our-instructors/index.html 200
/our-instructors/1 /our-instructors/1/index.html 200
/our-instructors/2 /our-instructors/2/index.html 200
/our-instructors/3 /our-instructors/3/index.html 200
/our-instructors/4 /our-instructors/4/index.html 200
/our-instructors/1/book /our-instructors/1/book/index.html 200
/our-instructors/2/book /our-instructors/2/book/index.html 200
/our-instructors/3/book /our-instructors/3/book/index.html 200
/our-instructors/4/book /our-instructors/4/book/index.html 200
/book /book/index.html 200

# Client-side SPA fallback (prevents any Netlify 404)
/* /index.html 200
`.trim() + '\n';

  fs.writeFileSync(path.join(targetDir, '_redirects'), redirectsContent);
  console.log('✓ Created Netlify _redirects file for SPA client routing');

  console.log('\n======================================================');
  console.log('🎉 OUR_INSTRUCTORS_NETLIFY IS READY FOR NETLIFY DEPLOY!');
  console.log(`Folder path: ${targetDir}`);
  console.log('======================================================\n');
}

exportPages();
