const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
  role: 'BUYER'
};

const testSeller = {
  email: 'seller@example.com',
  password: 'sellerpassword123',
  name: 'Test Seller',
  role: 'SELLER',
  storeName: 'Test Store',
  storeDescription: 'A test bookstore'
};

async function testAuth() {
  try {
    console.log('🧪 Testing JWT Authentication System');
    console.log('===================================\n');

    // Test 1: Register a buyer
    console.log('1. Testing user registration (BUYER)...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful');
    console.log('Token:', registerResponse.data.token ? 'Received' : 'Missing');
    console.log('User:', registerResponse.data.user.name, `(${registerResponse.data.user.role})`);
    
    const buyerToken = registerResponse.data.token;

    // Test 2: Register a seller
    console.log('\n2. Testing seller registration...');
    const sellerResponse = await axios.post(`${BASE_URL}/auth/register`, testSeller);
    console.log('✅ Seller registration successful');
    console.log('Store:', sellerResponse.data.user.storeName);
    
    const sellerToken = sellerResponse.data.token;

    // Test 3: Test duplicate registration
    console.log('\n3. Testing duplicate registration...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('❌ Duplicate registration should have failed');
    } catch (error) {
      console.log('✅ Duplicate registration properly rejected:', error.response.data.message);
    }

    // Test 4: Login with correct credentials
    console.log('\n4. Testing login with correct credentials...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful');
    console.log('Token:', loginResponse.data.token ? 'Received' : 'Missing');

    // Test 5: Login with incorrect credentials
    console.log('\n5. Testing login with incorrect credentials...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: 'wrongpassword'
      });
      console.log('❌ Login should have failed');
    } catch (error) {
      console.log('✅ Invalid credentials properly rejected:', error.response.data.message);
    }

    // Test 6: Access protected route with token
    console.log('\n6. Testing protected route access...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    console.log('✅ Protected route access successful');
    console.log('User profile:', meResponse.data.user.name, `(${meResponse.data.user.email})`);

    // Test 7: Access protected route without token
    console.log('\n7. Testing protected route without token...');
    try {
      await axios.get(`${BASE_URL}/auth/me`);
      console.log('❌ Access should have been denied');
    } catch (error) {
      console.log('✅ Access properly denied:', error.response.data.message);
    }

    // Test 8: Update profile
    console.log('\n8. Testing profile update...');
    const updateResponse = await axios.put(`${BASE_URL}/auth/profile`, {
      name: 'Updated Test User',
      phone: '+1234567890'
    }, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    console.log('✅ Profile update successful');
    console.log('Updated name:', updateResponse.data.user.name);

    // Test 9: Change password
    console.log('\n9. Testing password change...');
    await axios.post(`${BASE_URL}/auth/change-password`, {
      currentPassword: testUser.password,
      newPassword: 'newpassword123'
    }, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    console.log('✅ Password change successful');

    // Test 10: Login with new password
    console.log('\n10. Testing login with new password...');
    const newLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: 'newpassword123'
    });
    console.log('✅ Login with new password successful');

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
if (require.main === module) {
  testAuth();
}

module.exports = { testAuth };