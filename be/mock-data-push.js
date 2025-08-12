const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Category = require('./models/Category');
const Author = require('./models/Author');
const Publisher = require('./models/Publisher');
const Book = require('./models/Book');
const Review = require('./models/Review');
const User = require('./models/User');

// Mock data
const mockAuthors = [
  {
    name: 'J.K. Rowling',
    bio: 'British author best known for the Harry Potter fantasy series.',
    nationality: 'British',
    birthYear: 1965,
  },
  {
    name: 'Stephen King',
    bio: 'American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.',
    nationality: 'American',
    birthYear: 1947,
  },
  {
    name: 'Agatha Christie',
    bio: 'English writer known for her detective novels, particularly those featuring Hercule Poirot and Miss Marple.',
    nationality: 'British',
    birthYear: 1890,
  },
  {
    name: 'George Orwell',
    bio: 'English novelist, critic, and journalist known for works like 1984 and Animal Farm.',
    nationality: 'British',
    birthYear: 1903,
  },
  {
    name: 'Jane Austen',
    bio: 'English novelist known for her social commentary and wit in novels like Pride and Prejudice.',
    nationality: 'British',
    birthYear: 1775,
  },
];

const mockPublishers = [
  {
    name: 'Penguin Random House',
    description: 'Leading global trade book publisher',
    website: 'https://penguinrandomhouse.com',
    email: 'info@penguinrandomhouse.com',
    phone: '+1-212-782-9000',
  },
  {
    name: 'HarperCollins',
    description: 'One of the "Big Five" publishers',
    website: 'https://harpercollins.com',
    email: 'info@harpercollins.com', 
    phone: '+1-212-207-7000',
  },
  {
    name: 'Macmillan Publishers',
    description: 'British publishing company',
    website: 'https://macmillan.com',
    email: 'info@macmillan.com',
    phone: '+1-646-307-5151',
  },
];

const mockCategories = [
  {
    name: 'Fiction',
    description: 'Literary fiction and novels',
    slug: 'fiction',
    isActive: true,
  },
  {
    name: 'Mystery & Thriller',
    description: 'Suspenseful and mysterious stories',
    slug: 'mystery-thriller',
    isActive: true,
  },
  {
    name: 'Science Fiction & Fantasy',
    description: 'Imaginative and futuristic stories',
    slug: 'sci-fi-fantasy',
    isActive: true,
  },
  {
    name: 'Romance',
    description: 'Love stories and romantic fiction',
    slug: 'romance',
    isActive: true,
  },
  {
    name: 'Non-Fiction',
    description: 'Real-world topics and factual content',
    slug: 'non-fiction',
    isActive: true,
  },
  {
    name: 'History',
    description: 'Historical events and biographies',
    slug: 'history',
    isActive: true,
  },
  {
    name: 'Business',
    description: 'Business and entrepreneurship',
    slug: 'business',
    isActive: true,
  },
  {
    name: 'Self-Help',
    description: 'Personal development and motivation',
    slug: 'self-help',
    isActive: true,
  },
];

// Mock user for seller
const mockSeller = {
  email: 'seller@bookstore.com',
  password: 'seller123',
  name: 'Book Seller',
  role: 'SELLER',
  storeName: 'Classic Books Store',
  storeDescription: 'Specializing in classic literature and rare books',
  verified: true,
  profileComplete: true,
  isActive: true
};

// Function to connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book-store');
    console.log(' Connected to MongoDB');
  } catch (error) {
    console.error('L Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

// Function to clear existing data
async function clearData() {
  try {
    await Review.deleteMany({});
    await Book.deleteMany({});
    await Category.deleteMany({});
    await Author.deleteMany({});
    await Publisher.deleteMany({});
    await User.deleteMany({ email: 'seller@bookstore.com' }); // Only delete mock seller
    console.log(' Cleared existing mock data');
  } catch (error) {
    console.error('L Error clearing data:', error.message);
  }
}

// Function to insert mock data
async function insertMockData() {
  try {
    console.log('Starting mock data insertion...');

    // Insert mock seller
    console.log('=d Inserting mock seller...');
    const seller = await User.create(mockSeller);
    console.log(` Created seller: ${seller.name}`);

    // Insert authors
    console.log('Inserting authors...');
    const authors = await Author.insertMany(mockAuthors);
    console.log(`Created ${authors.length} authors`);

    // Insert publishers
    console.log('<� Inserting publishers...');
    const publishers = await Publisher.insertMany(mockPublishers);
    console.log(`Created ${publishers.length} publishers`);

    // Insert categories
    console.log('=� Inserting categories...');
    const categories = await Category.insertMany(mockCategories);
    console.log(`  Created ${categories.length} categories`);

    // Create mock books with proper references
    const mockBooks = [
      {
        title: 'Harry Potter and the Philosopher\'s Stone',
        slug: 'harry-potter-philosophers-stone',
        description: 'The first book in the Harry Potter series follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday.',
        isbn: '9780747532699',
        authorId: authors[0]._id, // J.K. Rowling
        publisherId: publishers[0]._id, // Penguin Random House
        categoryId: categories[2]._id, // Science Fiction & Fantasy
        price: 12.99,
        discountPrice: 10.99,
        stock: 50,
        images: ['/books/harry-potter-1-1.jpg', '/books/harry-potter-1-2.jpg'],
        thumbnail: '/books/harry-potter-1-thumb.jpg',
        status: 'PUBLISHED',
        language: 'English',
        pages: 223,
        publishedYear: 1997,
        sellerId: seller._id,
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
        authorId: authors[1]._id, // Stephen King
        publisherId: publishers[1]._id, // HarperCollins
        categoryId: categories[1]._id, // Mystery & Thriller
        price: 14.99,
        stock: 32,
        images: ['/books/shining-1.jpg', '/books/shining-2.jpg'],
        thumbnail: '/books/shining-thumb.jpg',
        status: 'PUBLISHED',
        language: 'English',
        pages: 447,
        publishedYear: 1977,
        sellerId: seller._id,
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
        authorId: authors[2]._id, // Agatha Christie
        publisherId: publishers[1]._id, // HarperCollins
        categoryId: categories[1]._id, // Mystery & Thriller
        price: 11.99,
        stock: 28,
        images: ['/books/orient-express-1.jpg'],
        thumbnail: '/books/orient-express-thumb.jpg',
        status: 'PUBLISHED',
        language: 'English',
        pages: 256,
        publishedYear: 1934,
        sellerId: seller._id,
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
        authorId: authors[3]._id, // George Orwell
        publisherId: publishers[0]._id, // Penguin Random House
        categoryId: categories[0]._id, // Fiction
        price: 13.99,
        stock: 45,
        images: ['/books/1984-1.jpg'],
        thumbnail: '/books/1984-thumb.jpg',
        status: 'PUBLISHED',
        language: 'English',
        pages: 328,
        publishedYear: 1949,
        sellerId: seller._id,
        tags: ['dystopian', 'political', 'surveillance', 'classic'],
        averageRating: 4.9,
        totalReviews: 0,
        salesCount: 2356,
        isActive: true
      },
      {
        title: 'Pride and Prejudice',
        slug: 'pride-and-prejudice',
        description: 'A romantic novel following Elizabeth Bennet and her complex relationship with Mr. Darcy.',
        isbn: '9780141439518',
        authorId: authors[4]._id, // Jane Austen
        publisherId: publishers[0]._id, // Penguin Random House
        categoryId: categories[3]._id, // Romance
        price: 10.99,
        stock: 38,
        images: ['/books/pride-prejudice-1.jpg'],
        thumbnail: '/books/pride-prejudice-thumb.jpg',
        status: 'PUBLISHED',
        language: 'English',
        pages: 432,
        publishedYear: 1813,
        sellerId: seller._id,
        tags: ['romance', 'classic', 'regency', 'social commentary'],
        averageRating: 4.8,
        totalReviews: 0,
        salesCount: 1892,
        isActive: true
      },
    ];

    // Insert books
    console.log('=� Inserting books...');
    const books = await Book.insertMany(mockBooks);
    console.log(` Created ${books.length} books`);

    // Create mock reviews
    const mockReviews = [
      {
        bookId: books[0]._id, // Harry Potter
        userId: seller._id, // Using seller as reviewer for demo
        rating: 5,
        title: 'Magical and captivating',
        comment: 'This book transported me to a magical world. J.K. Rowling\'s writing is exceptional and the characters are unforgettable.',
        helpful: 234,
        notHelpful: 12,
        verified: true,
        status: 'APPROVED'
      },
      {
        bookId: books[1]._id, // The Shining
        userId: seller._id,
        rating: 5,
        title: 'Terrifyingly brilliant',
        comment: 'Stephen King at his absolute best. This book will keep you up at night, but you won\'t be able to put it down.',
        helpful: 189,
        notHelpful: 8,
        verified: true,
        status: 'APPROVED'
      },
      {
        bookId: books[2]._id, // Orient Express
        userId: seller._id,
        rating: 4,
        title: 'Classic mystery at its finest',
        comment: 'Agatha Christie weaves a brilliant mystery that keeps you guessing until the very end. Hercule Poirot is a fantastic detective.',
        helpful: 156,
        notHelpful: 23,
        verified: true,
        status: 'APPROVED'
      }
    ];

    // Insert reviews
    console.log('P Inserting reviews...');
    const reviews = await Review.insertMany(mockReviews);
    console.log(` Created ${reviews.length} reviews`);

    // Update books with review counts and ratings
    console.log('=� Updating book ratings...');
    for (let i = 0; i < books.length; i++) {
      const bookReviews = reviews.filter(review => review.bookId.toString() === books[i]._id.toString());
      if (bookReviews.length > 0) {
        const avgRating = bookReviews.reduce((sum, review) => sum + review.rating, 0) / bookReviews.length;
        await Book.findByIdAndUpdate(books[i]._id, {
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: bookReviews.length
        });
      }
    }

    console.log('<� Mock data insertion completed successfully!');
    console.log(`
=� Summary:
   - ${authors.length} Authors created
   - ${publishers.length} Publishers created  
   - ${categories.length} Categories created
   - ${books.length} Books created
   - ${reviews.length} Reviews created
   - 1 Mock seller created
    `);

  } catch (error) {
    console.error('L Error inserting mock data:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('=� Starting mock data upload process...');
    
    await connectDB();
    await clearData();
    await insertMockData();
    
    console.log(' Mock data upload completed successfully!');
    
  } catch (error) {
    console.error('L Mock data upload failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('=K Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
main();