const fs = require('fs');
const path = require('path');

const directories = [
  'src',
  'src/pages',
  'src/pages/events',
  'src/pages/club',
  'src/pages/admin',
  'src/pages/auth',
  'src/pages/student',
  'src/components',
  'src/components/common',
  'src/components/layout',
  'src/context',
  'src/utils'
];

const baseDir = "C:\\Users\\Ameen Khan\\Documents\\gec-portal\\frontend";

console.log("Creating directory structure...\n");

directories.forEach(dir => {
  const fullPath = path.join(baseDir, dir);
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✓ Created: ${dir}`);
    } else {
      console.log(`✓ Already exists: ${dir}`);
    }
  } catch (err) {
    console.error(`✗ Error creating ${dir}: ${err.message}`);
  }
});

console.log("\n=== Verification ===\n");

directories.forEach(dir => {
  const fullPath = path.join(baseDir, dir);
  const exists = fs.existsSync(fullPath);
  const status = exists ? "✓" : "✗";
  console.log(`${status} ${fullPath}`);
});

console.log("\nDone!");
