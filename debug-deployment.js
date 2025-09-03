// Debug script for white screen issues
console.log('🔍 VLIC Deployment Debug Script');
console.log('================================');

// 1. Check environment
console.log('\n📋 Environment Check:');
console.log('- User Agent:', navigator.userAgent);
console.log('- URL:', window.location.href);
console.log('- Protocol:', window.location.protocol);
console.log('- Host:', window.location.host);

// 2. Check DOM
console.log('\n🏗️ DOM Check:');
const root = document.getElementById('root');
console.log('- Root element exists:', !!root);
console.log('- Root innerHTML length:', root ? root.innerHTML.length : 0);
console.log('- Root children count:', root ? root.children.length : 0);

// 3. Check resources
console.log('\n📦 Resource Check:');
const scripts = document.querySelectorAll('script[src]');
const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
console.log('- Script tags:', scripts.length);
console.log('- Stylesheet tags:', stylesheets.length);

scripts.forEach((script, i) => {
  console.log(`  Script ${i + 1}:`, script.src);
});

stylesheets.forEach((link, i) => {
  console.log(`  Stylesheet ${i + 1}:`, link.href);
});

// 4. Check localStorage
console.log('\n💾 Storage Check:');
try {
  localStorage.setItem('test', 'ok');
  localStorage.removeItem('test');
  console.log('- LocalStorage: ✅ Working');
} catch (e) {
  console.log('- LocalStorage: ❌', e.message);
}

// 5. Check fetch
console.log('\n🌐 Network Check:');
fetch('/favicon.ico')
  .then(response => {
    console.log('- Fetch test: ✅ Working');
    console.log('- Response status:', response.status);
  })
  .catch(error => {
    console.log('- Fetch test: ❌', error.message);
  });

// 6. Check React
console.log('\n⚛️ React Check:');
if (typeof React !== 'undefined') {
  console.log('- React available: ✅');
  console.log('- React version:', React.version);
} else {
  console.log('- React available: ❌');
}

// 7. Check errors
console.log('\n🚨 Error Monitoring:');
window.addEventListener('error', (e) => {
  console.error('💥 Global Error:', e.error);
  console.error('- Message:', e.message);
  console.error('- Filename:', e.filename);
  console.error('- Line:', e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('💥 Unhandled Promise Rejection:', e.reason);
});

console.log('🎯 Debug script loaded. Check console for any errors.');
