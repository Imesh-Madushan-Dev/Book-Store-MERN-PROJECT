const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('./models/User');
const Book = require('./models/Book');
const Category = require('./models/Category');
const Author = require('./models/Author');
const Publisher = require('./models/Publisher');
const Review = require('./models/Review');
const Order = require('./models/Order');
const Cart = require('./models/Cart');

async function testAllModels() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book-store');
    console.log('✅ Connected to MongoDB');

    // Test Category CRUD
    console.log('\n🏷️  Testing Category CRUD operations:');
    const timestamp = Date.now();
    const category = await Category.create({
      name: `Fiction ${timestamp}`,
      slug: `fiction-${timestamp}`,
      description: 'Fictional stories and novels',
      isActive: true
    });
    console.log('✅ Category created:', category.name);

    // Test Author CRUD
    console.log('\n👤 Testing Author CRUD operations:');
    const author = await Author.create({
      name: `John Doe ${timestamp}`,
      slug: `john-doe-${timestamp}`,
      bio: 'A prolific writer of fiction novels',
      isActive: true
    });
    console.log('✅ Author created:', author.name);

    // Test Publisher CRUD
    console.log('\n🏢 Testing Publisher CRUD operations:');
    const publisher = await Publisher.create({
      name: `Test Publisher ${timestamp}`,
      slug: `test-publisher-${timestamp}`,
      description: 'A leading book publisher',
      isActive: true
    });
    console.log('✅ Publisher created:', publisher.name);

    // Test User CRUD
    console.log('\n👥 Testing User CRUD operations:');
    const user = await User.create({
      email: `test${timestamp}@example.com`,
      password: 'testpassword123',
      name: 'Test User',
      role: 'BUYER',
      isActive: true
    });
    console.log('✅ User created:', user.email);

    // Test Book CRUD
    console.log('\n📚 Testing Book CRUD operations:');
    const book = await Book.create({
      title: `Test Book ${timestamp}`,
      description: 'A test book for CRUD operations',
      isbn: `978123456789${timestamp.toString().slice(-1)}`,
      authorId: author._id,
      publisherId: publisher._id,
      categoryId: category._id,
      sellerId: user._id,
      price: 19.99,
      stock: 100,
      images: ['https://example.com/test-image.jpg'],
      thumbnail: 'https://example.com/test-thumbnail.jpg',
      format: 'PAPERBACK',
      publishedYear: 2023,
      status: 'ACTIVE'
    });
    console.log('✅ Book created:', book.title);

    // Test Review CRUD
    console.log('\n⭐ Testing Review CRUD operations:');
    const review = await Review.create({
      userId: user._id,
      bookId: book._id,
      rating: 5,
      title: 'Great book!',
      comment: 'This is an excellent book for testing purposes.',
      verified: true
    });
    console.log('✅ Review created with rating:', review.rating);

    // Test Cart CRUD
    console.log('\n🛒 Testing Cart CRUD operations:');
    const cart = await Cart.create({
      userId: user._id,
      items: [{
        bookId: book._id,
        quantity: 2,
        price: book.price
      }]
    });
    console.log('✅ Cart created with', cart.items.length, 'item(s)');

    // Test Order CRUD
    console.log('\n📦 Testing Order CRUD operations:');
    const order = await Order.create({
      userId: user._id,
      items: [{
        bookId: book._id,
        quantity: 1,
        price: book.price,
        totalPrice: book.price
      }],
      subtotal: book.price,
      tax: 0,
      shipping: 0,
      totalAmount: book.price,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      shippingAddress: {
        name: 'Test Address',
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'United States'
      }
    });
    console.log('✅ Order created with total:', order.totalAmount);

    // Test Read Operations
    console.log('\n📖 Testing Read operations:');
    const foundBook = await Book.findById(book._id)
      .populate('authorId')
      .populate('publisherId')
      .populate('categoryId');
    console.log('✅ Book found with populated data:', foundBook.title);
    console.log('   - Author:', foundBook.authorId.name);
    console.log('   - Publisher:', foundBook.publisherId.name);
    console.log('   - Category:', foundBook.categoryId.name);

    // Test Update Operations
    console.log('\n✏️  Testing Update operations:');
    await Book.findByIdAndUpdate(book._id, { price: 24.99 });
    const updatedBook = await Book.findById(book._id);
    console.log('✅ Book price updated to:', updatedBook.price);

    // Test aggregation (Virtual fields)
    console.log('\n🔢 Testing virtual fields and aggregation:');
    const bookWithRating = await Book.findById(book._id);
    console.log('✅ Book rating (virtual):', bookWithRating.rating);
    console.log('✅ Book review count (virtual):', bookWithRating.reviewCount);

    // Test Delete Operations
    console.log('\n🗑️  Testing Delete operations:');
    await Review.findByIdAndDelete(review._id);
    await Cart.findByIdAndDelete(cart._id);
    await Order.findByIdAndDelete(order._id);
    await Book.findByIdAndDelete(book._id);
    await User.findByIdAndDelete(user._id);
    await Publisher.findByIdAndDelete(publisher._id);
    await Author.findByIdAndDelete(author._id);
    await Category.findByIdAndDelete(category._id);
    console.log('✅ All test records deleted');

    console.log('\n🎉 All CRUD operations completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during CRUD testing:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

testAllModels();