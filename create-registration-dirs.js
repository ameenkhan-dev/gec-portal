const fs = require('fs');
const path = require('path');

// Directories to create
const dirs = [
    'backend/controllers',
    'backend/routes',
    'frontend/src',
    'frontend/src/pages',
    'frontend/src/pages/student',
    'frontend/src/pages/club',
    'frontend/src/pages/events',
    'frontend/src/components',
    'frontend/src/services'
];

dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created: ${dir}`);
    } else {
        console.log(`✔️  Already exists: ${dir}`);
    }
});

console.log('\n✅ All directories created successfully!');
