const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Category = require('../models/Category');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Book = require('../models/Book');
const User = require('../models/User');

// Mock data
const mockCategories = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Fiction',
    description: 'Literary fiction and novels',
    slug: 'fiction',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Mystery & Thriller',
    description: 'Suspenseful and mysterious stories',
    slug: 'mystery-thriller',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Science Fiction & Fantasy',
    description: 'Imaginative and futuristic stories',
    slug: 'sci-fi-fantasy',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Romance',
    description: 'Love stories and romantic fiction',
    slug: 'romance',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Non-Fiction',
    description: 'Real-world topics and factual content',
    slug: 'non-fiction',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'History',
    description: 'Historical events and biographies',
    slug: 'history',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Business',
    description: 'Business and entrepreneurship',
    slug: 'business',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Self-Help',
    description: 'Personal development and motivation',
    slug: 'self-help',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Programming',
    description: 'Software development and programming',
    slug: 'programming',
    isActive: true,
  },
];

const mockAuthors = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'J.K. Rowling',
    slug: 'jk-rowling',
    bio: 'British author best known for the Harry Potter fantasy series.',
    nationality: 'British',
    birthYear: 1965,
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Stephen King',
    slug: 'stephen-king',
    bio: 'American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.',
    nationality: 'American',
    birthYear: 1947,
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Agatha Christie',
    slug: 'agatha-christie',
    bio: 'English writer known for her detective novels, particularly those featuring Hercule Poirot and Miss Marple.',
    nationality: 'British',
    birthYear: 1890,
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'George Orwell',
    slug: 'george-orwell',
    bio: 'English novelist, critic, and journalist known for works like 1984 and Animal Farm.',
    nationality: 'British',
    birthYear: 1903,
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Jane Austen',
    slug: 'jane-austen',
    bio: 'English novelist known for her social commentary and wit in novels like Pride and Prejudice.',
    nationality: 'British',
    birthYear: 1775,
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Robert C. Martin',
    slug: 'robert-c-martin',
    bio: 'American software engineer and instructor, best known for being one of the authors of the Agile Manifesto.',
    nationality: 'American',
    birthYear: 1952,
    isActive: true,
  },
];

const mockPublishers = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Penguin Random House',
    slug: 'penguin-random-house',
    description: 'Leading global trade book publisher',
    website: 'https://penguinrandomhouse.com',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'HarperCollins',
    slug: 'harpercollins',
    description: 'One of the "Big Five" publishers',
    website: 'https://harpercollins.com',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Macmillan Publishers',
    slug: 'macmillan-publishers',
    description: 'British publishing company',
    website: 'https://macmillan.com',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: "O'Reilly Media",
    slug: 'oreilly-media',
    description: 'Technology and business publisher',
    website: 'https://oreilly.com',
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Book.deleteMany({});
    await Category.deleteMany({});
    await Author.deleteMany({});
    await Publisher.deleteMany({});
    console.log('✅ Existing data cleared');

    // Insert Categories
    console.log('📚 Inserting categories...');
    const insertedCategories = await Category.insertMany(mockCategories);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Insert Authors
    console.log('👤 Inserting authors...');
    const insertedAuthors = await Author.insertMany(mockAuthors);
    console.log(`✅ Inserted ${insertedAuthors.length} authors`);

    // Insert Publishers
    console.log('🏢 Inserting publishers...');
    const insertedPublishers = await Publisher.insertMany(mockPublishers);
    console.log(`✅ Inserted ${insertedPublishers.length} publishers`);

    // Create a seller user if doesn't exist
    console.log('👨‍💼 Creating seller user...');
    let seller = await User.findOne({ email: 'seller@bookstore.com' });
    if (!seller) {
      seller = await User.create({
        email: 'seller@bookstore.com',
        password: 'seller123',
        name: 'Book Seller',
        role: 'SELLER',
        storeName: 'Classic Books Store',
        storeDescription: 'Specializing in classic literature and programming books',
        verified: true,
        profileComplete: true,
        isActive: true
      });
      console.log('✅ Created seller user');
    } else {
      console.log('✅ Seller user already exists');
    }

    // Insert sample books
    console.log('📖 Inserting sample books...');
    const sampleBooks = [
      {
        title: "Harry Potter and the Philosopher's Stone",
        slug: 'harry-potter-philosophers-stone',
        description: 'The first book in the Harry Potter series follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday.',
        isbn: '9780747532699',
        authorId: insertedAuthors[0]._id, // J.K. Rowling
        publisherId: insertedPublishers[0]._id, // Penguin Random House
        categoryId: insertedCategories[2]._id, // Science Fiction & Fantasy
        sellerId: seller._id,
        price: 12.99,
        discountPrice: 10.99,
        stock: 50,
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'],
        thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        format: 'PAPERBACK',
        status: 'ACTIVE',
        language: 'English',
        pages: 223,
        publishedYear: 1997,
        tags: ['magic', 'wizards', 'adventure', 'young adult'],
        averageRating: 4.8,
        totalReviews: 0,
        salesCount: 1542,
        isActive: true
      },
      {
        title: 'The Shining',
        slug: 'the-shining',
        description: 'A masterpiece of horror fiction about Jack Torrance, who becomes winter caretaker of the isolated Overlook Hotel.',
        isbn: '9780307743657',
        authorId: insertedAuthors[1]._id, // Stephen King
        publisherId: insertedPublishers[1]._id, // HarperCollins
        categoryId: insertedCategories[1]._id, // Mystery & Thriller
        sellerId: seller._id,
        price: 14.99,
        stock: 32,
        images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'],
        thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
        format: 'PAPERBACK',
        status: 'ACTIVE',
        language: 'English',
        pages: 447,
        publishedYear: 1977,
        tags: ['horror', 'psychological thriller', 'isolation'],
        averageRating: 4.6,
        totalReviews: 0,
        salesCount: 893,
        isActive: true
      },
      {
        title: 'Murder on the Orient Express',
        slug: 'murder-on-the-orient-express',
        description: 'Hercule Poirot investigates a murder aboard the famous Orient Express train.',
        isbn: '9780062693662',
        authorId: insertedAuthors[2]._id, // Agatha Christie
        publisherId: insertedPublishers[1]._id, // HarperCollins
        categoryId: insertedCategories[1]._id, // Mystery & Thriller
        sellerId: seller._id,
        price: 11.99,
        stock: 28,
        images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        format: 'PAPERBACK',
        status: 'ACTIVE',
        language: 'English',
        pages: 256,
        publishedYear: 1934,
        tags: ['mystery', 'detective', 'classic', 'whodunit'],
        averageRating: 4.7,
        totalReviews: 0,
        salesCount: 1245,
        isActive: true
      },
      {
        title: '1984',
        slug: '1984',
        description: 'A dystopian novel about totalitarian control and surveillance in a future society.',
        isbn: '9780452284234',
        authorId: insertedAuthors[3]._id, // George Orwell
        publisherId: insertedPublishers[0]._id, // Penguin Random House
        categoryId: insertedCategories[0]._id, // Fiction
        sellerId: seller._id,
        price: 13.99,
        stock: 45,
        images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'],
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        format: 'PAPERBACK',
        status: 'ACTIVE',
        language: 'English',
        pages: 328,
        publishedYear: 1949,
        tags: ['dystopian', 'political', 'surveillance', 'classic'],
        averageRating: 4.9,
        totalReviews: 0,
        salesCount: 2356,
        isActive: true
      },
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        slug: 'clean-code',
        description: 'A handbook for writing readable, reusable, and refactorable software code.',
        isbn: '9780132350884',
        authorId: insertedAuthors[5]._id, // Robert C. Martin
        publisherId: insertedPublishers[3]._id, // O'Reilly Media
        categoryId: insertedCategories[8]._id, // Programming
        sellerId: seller._id,
        price: 49.99,
        discountPrice: 39.99,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400'],
        thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
        format: 'PAPERBACK',
        status: 'ACTIVE',
        language: 'English',
        pages: 464,
        publishedYear: 2008,
        tags: ['programming', 'software development', 'clean code', 'best practices'],
        averageRating: 4.8,
        totalReviews: 0,
        salesCount: 1823,
        isActive: true
      }
    ];

    const insertedBooks = await Book.insertMany(sampleBooks);
    console.log(`✅ Inserted ${insertedBooks.length} sample books`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
   - ${insertedCategories.length} Categories
   - ${insertedAuthors.length} Authors  
   - ${insertedPublishers.length} Publishers
   - ${insertedBooks.length} Books
   - 1 Seller user created
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding
seedDatabase();