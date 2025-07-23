const fs = require('fs');
const path = require('path');

console.log('🔍 Checking production build...\n');

// Check if dist folder exists
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found! Run npm run build first.');
  process.exit(1);
}

// Check essential files
const essentialFiles = [
  'index.html',
  '_redirects',
  'assets/index-Bu9xh_y5.css',
  'assets/index-krx_raVp.js'
];

console.log('📁 Checking essential files:');
essentialFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
  }
});

// Check if index.html has proper content
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  if (content.includes('<div id="root"></div>')) {
    console.log('✅ index.html has root element');
  } else {
    console.log('❌ index.html missing root element');
  }
  
  if (content.includes('src="/src/main.tsx"')) {
    console.log('❌ index.html still references source files');
  } else {
    console.log('✅ index.html properly built');
  }
}

// Check _redirects file
const redirectsPath = path.join(distPath, '_redirects');
if (fs.existsSync(redirectsPath)) {
  const content = fs.readFileSync(redirectsPath, 'utf8');
  if (content.includes('/*    /index.html   200')) {
    console.log('✅ _redirects file properly configured');
  } else {
    console.log('❌ _redirects file missing proper configuration');
  }
}

console.log('\n🎉 Build check completed!');
console.log('\n📋 Next steps:');
console.log('1. Commit and push your changes to GitHub');
console.log('2. Check AWS Amplify Console for build status');
console.log('3. Verify environment variables are set in Amplify');
console.log('4. Test the deployed application'); 