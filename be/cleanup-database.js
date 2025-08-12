const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupDatabase() {
  try {
    console.log('🔧 Starting database cleanup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the clerkId index from users collection
    console.log('🗑️ Dropping old clerkId index...');
    try {
      await db.collection('users').dropIndex('clerkId_1');
      console.log('✅ Dropped clerkId index successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️ Index clerkId_1 does not exist (already removed)');
      } else {
        console.log('⚠️ Error dropping index:', error.message);
      }
    }

    // Remove all existing users (since they have old structure)
    console.log('🧹 Cleaning up existing users with old structure...');
    const result = await db.collection('users').deleteMany({});
    console.log(`✅ Removed ${result.deletedCount} old user records`);

    // Also clean up related collections that might have invalid data
    console.log('🧹 Cleaning up related collections...');
    
    // Clean up carts
    await db.collection('carts').deleteMany({});
    console.log('✅ Cleaned up carts collection');

    // Clean up orders
    await db.collection('orders').deleteMany({});
    console.log('✅ Cleaned up orders collection');

    // Clean up reviews
    await db.collection('reviews').deleteMany({});
    console.log('✅ Cleaned up reviews collection');

    console.log('🎉 Database cleanup completed successfully!');
    console.log('📝 You can now create new users with the updated authentication system');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupDatabase();