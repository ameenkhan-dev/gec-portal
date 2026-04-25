const fs = require('fs');
const path = require('path');

const dirs = [
  'C:\\Users\\Ameen Khan\\Documents\\gec-portal\\backend\\controllers',
  'C:\\Users\\Ameen Khan\\Documents\\gec-portal\\backend\\routes',
  'C:\\Users\\Ameen Khan\\Documents\\gec-portal\\frontend\\src\\pages\\events',
  'C:\\Users\\Ameen Khan\\Documents\\gec-portal\\frontend\\src\\pages\\club',
  'C:\\Users\\Ameen Khan\\Documents\\gec-portal\\frontend\\src\\pages\\admin'
];

dirs.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log('Created:', dir);
});

console.log('All directories created successfully!');
