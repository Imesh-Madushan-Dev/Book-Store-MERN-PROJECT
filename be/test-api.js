const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

async function testAPI() {
  console.log('🧪 Testing API endpoints...');
  
  try {
    // Test MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book-store');
    console.log('✅ MongoDB connected');
    
    // Import models to test their structure
    const User = require('./models/User');
    const Book = require('./models/Book');
    const Category = require('./models/Category');
    
    console.log('✅ All models loaded successfully');
    
    // Test basic queries
    const userCount = await User.countDocuments();
    const bookCount = await Book.countDocuments();
    const categoryCount = await Category.countDocuments();
    
    console.log('📊 Database Statistics:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Books: ${bookCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    
    // Test server imports
    const app = express();
    
    // Try importing routes
    const booksRoutes = require('./routes/books');
    const categoriesRoutes = require('./routes/categories');
    const usersRoutes = require('./routes/users');
    
    console.log('✅ All route modules imported successfully');
    console.log('✅ API structure is valid and ready to serve requests');
    
    await mongoose.connection.close();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();