import React from 'react';

const TestApp = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1>🎯 VLIC React Test</h1>
        <div style={{ margin: '1rem 0' }}>
          <div style={{ color: '#4ade80' }}>✅ React rendering</div>
          <div style={{ color: '#4ade80' }}>✅ TypeScript compiling</div>
          <div style={{ color: '#4ade80' }}>✅ Vite bundling</div>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            Go to Main App
          </button>
          
          <button 
            onClick={() => console.log('Console test:', new Date())}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            Console Test
          </button>
        </div>
        
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
          Build Time: {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
};

export default TestApp;
