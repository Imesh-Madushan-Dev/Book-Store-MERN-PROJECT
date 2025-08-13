const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Test that we can connect to MongoDB and create a user with our new schema
async function testBasic() {
  try {
    console.log('🧪 Testing Basic MongoDB Authentication');
    console.log('=====================================');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = require('../models/User');
    
    // Test password hashing
    console.log('\n1. Testing password hashing...');
    const testUser = new User({
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User',
      role: 'BUYER'
    });
    
    await testUser.save();
    console.log('✅ User created with hashed password');
    
    // Test password comparison
    console.log('\n2. Testing password comparison...');
    const isMatch = await testUser.comparePassword('testpassword123');
    console.log('✅ Password comparison works:', isMatch);
    
    const isWrongMatch = await testUser.comparePassword('wrongpassword');
    console.log('✅ Wrong password properly rejected:', !isWrongMatch);
    
    // Test finding by email
    console.log('\n3. Testing findByEmail static method...');
    const foundUser = await User.findByEmail('test@example.com');
    console.log('✅ User found by email:', foundUser.name);
    
    // Cleanup
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Test user cleaned up');
    
    console.log('\n🎉 All basic tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testBasic();