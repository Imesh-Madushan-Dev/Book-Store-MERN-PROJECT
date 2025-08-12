const mongoose = require('mongoose');
require('dotenv').config();

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book-store');
    console.log('✅ Connected to MongoDB');
    
    // Drop all collections except users (to preserve any real user data)
    // const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.collection(collection.name).drop();
        console.log('🗑️  Dropped collection:', collection.name);
      } catch (err) {
        console.log('⚠️  Collection', collection.name, 'was empty or already dropped');
      }
    }
    
    console.log('✅ Database cleaned completely');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
  }
}

cleanDatabase();