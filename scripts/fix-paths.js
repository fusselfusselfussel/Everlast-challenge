const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');

function fixPaths(fileName) {
  const filePath = path.join(outDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${fileName} not found, skipping`);
    return;
  }
  
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/href="\/_next\//g, 'href="./_next/');
  html = html.replace(/src="\/_next\//g, 'src="./_next/');
  html = html.replace(/src="\/static\//g, 'src="./_next/static/');
  html = html.replace(/href="\/static\//g, 'href="./_next/static/');
  html = html.replace(/src="\.\/static\//g, 'src="./_next/static/');
  html = html.replace(/href="\.\/static\//g, 'href="./_next/static/');
  html = html.replace(/src="\/icons\//g, 'src="./icons/');
  html = html.replace(/href="\/icons\//g, 'href="./icons/');
  fs.writeFileSync(filePath, html);
  
  console.log(`✅ Fixed paths in ${fileName}`);
}

fixPaths('index.html');
fixPaths('editor.html');
fixPaths('404.html');
