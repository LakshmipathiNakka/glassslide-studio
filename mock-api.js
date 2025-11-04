const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(express.json());

// Test credentials
const USERS = {
  'admin': { password: 'admin123', role: 'admin', permissions: ['editor', 'admin'] },
  'editor': { password: 'editor123', role: 'editor', permissions: ['editor'] },
  'demo': { password: 'demo123', role: 'user', permissions: [] },
  'test': { password: 'test', role: 'editor', permissions: ['editor'] }
};

// Simple JWT mock (not for production!)
function createMockJWT(username, user) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: username,
    role: user.role,
    permissions: user.permissions,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    iat: Math.floor(Date.now() / 1000)
  };
  
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'mock_signature_' + Math.random().toString(36);
  
  return `${headerB64}.${payloadB64}.${signature}`;
}

app.post('/api/login', (req, res) => {
  console.log('Login attempt:', req.body);
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  const user = USERS[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const jwt_token = createMockJWT(username, user);
  
  console.log(`✅ Login successful: ${username} (${user.role})`);
  res.json({ jwt_token });
});

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Mock API is running',
    availableUsers: Object.keys(USERS).map(username => ({
      username,
      role: USERS[username].role,
      password: '***' // Don't expose in real apps!
    }))
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('\n🚀 Mock API server running on http://localhost:' + PORT);
  console.log('\n📋 Test Credentials:');
  Object.entries(USERS).forEach(([username, user]) => {
    console.log(`   ${username} / ${user.password} (${user.role})`);
  });
  console.log('\n💡 Set VITE_AUTH_URL=http://localhost:3001/api/login in your .env file\n');
});