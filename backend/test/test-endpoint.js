const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🧪 Testing Authentication Endpoints');
    console.log('==================================');
    
    // Test registration
    console.log('\n1. Testing user registration...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      email: 'testuser@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'BUYER'
    });
    
    console.log('✅ Registration successful');
    console.log('Response status:', registerResponse.status);
    console.log('User created:', registerResponse.data.user.name);
    console.log('Token received:', registerResponse.data.token ? 'Yes' : 'No');
    
    const token = registerResponse.data.token;
    
    // Test login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user.name);
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    
    // Test protected route
    console.log('\n3. Testing protected route...');
    const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Protected route access successful');
    console.log('User profile:', meResponse.data.user.name);
    
    console.log('\n🎉 All endpoint tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEndpoint();