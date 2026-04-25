/**
 * Setup Script for Registration and Attendance System
 * Creates all necessary directories and files
 */

const fs = require('fs');
const path = require('path');

// Helper function to create directories recursively
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dirPath}`);
    }
}

// Helper function to create file
function createFile(filePath, content) {
    if (fs.existsSync(filePath)) {
        console.log(`⚠️  File already exists (skipping): ${filePath}`);
        return false;
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Created file: ${filePath}`);
    return true;
}

const baseDir = __dirname;

// Create directories
console.log('\n📁 Creating directories...\n');
ensureDir(path.join(baseDir, 'backend', 'controllers'));
ensureDir(path.join(baseDir, 'backend', 'routes'));
ensureDir(path.join(baseDir, 'frontend', 'src'));
ensureDir(path.join(baseDir, 'frontend', 'src', 'pages'));
ensureDir(path.join(baseDir, 'frontend', 'src', 'pages', 'student'));
ensureDir(path.join(baseDir, 'frontend', 'src', 'pages', 'club'));
ensureDir(path.join(baseDir, 'frontend', 'src', 'pages', 'events'));
ensureDir(path.join(baseDir, 'frontend', 'src', 'components'));
ensureDir(path.join(baseDir, 'frontend', 'src', 'services'));

console.log('\n🚀 Setup completed!');
console.log('\nNext steps:');
console.log('1. Run: npm install (in backend and frontend)');
console.log('2. Create registration controller file');
console.log('3. Create registration routes file');
console.log('4. Update server.js to include registration routes');
console.log('5. Create frontend registration pages');
