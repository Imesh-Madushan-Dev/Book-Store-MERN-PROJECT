import { User, Book, Category, Author, Publisher, Review, Order, OrderItem, Address } from './types';

// Mock Authors
export const mockAuthors: Author[] = [
  {
    _id: '1',
    name: 'J.K. Rowling',
    slug: 'jk-rowling',
    bio: 'British author best known for the Harry Potter fantasy series.',
    image: '/authors/jk-rowling.jpg',
    nationality: 'British',
    birthYear: 1965,
  },
  {
    _id: '2',
    name: 'Stephen King',
    slug: 'stephen-king',
    bio: 'American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.',
    image: '/authors/stephen-king.jpg',
    nationality: 'American',
    birthYear: 1947,
  },
  {
    _id: '3',
    name: 'Agatha Christie',
    slug: 'agatha-christie',
    bio: 'English writer known for her detective novels, particularly those featuring Hercule Poirot and Miss Marple.',
    image: '/authors/agatha-christie.jpg',
    nationality: 'British',
    birthYear: 1890,
  },
  {
    _id: '4',
    name: 'George Orwell',
    slug: 'george-orwell',
    bio: 'English novelist, critic, and journalist known for works like 1984 and Animal Farm.',
    image: '/authors/george-orwell.jpg',
    nationality: 'British',
    birthYear: 1903,
  },
  {
    _id: '5',
    name: 'Jane Austen',
    slug: 'jane-austen',
    bio: 'English novelist known for her social commentary and wit in novels like Pride and Prejudice.',
    image: '/authors/jane-austen.jpg',
    nationality: 'British',
    birthYear: 1775,
  },
];

// Mock Publishers
export const mockPublishers: Publisher[] = [
  {
    _id: '1',
    name: 'Penguin Random House',
    slug: 'penguin-random-house',
    description: 'Leading global trade book publisher',
    website: 'https://penguinrandomhouse.com',
    logo: '/publishers/penguin.jpg',
  },
  {
    _id: '2',
    name: 'HarperCollins',
    slug: 'harpercollins',
    description: 'One of the "Big Five" publishers',
    website: 'https://harpercollins.com',
    logo: '/publishers/harpercollins.jpg',
  },
  {
    _id: '3',
    name: 'Macmillan Publishers',
    slug: 'macmillan-publishers',
    description: 'British publishing company',
    website: 'https://macmillan.com',
    logo: '/publishers/macmillan.jpg',
  },
];

// Mock Categories
export const mockCategories: Category[] = [
  {
    _id: '1',
    name: 'Fiction',
    description: 'Literary fiction and novels',
    slug: 'fiction',
    image: '/categories/fiction.jpg',
    bookCount: 1250,
  },
  {
    _id: '2',
    name: 'Mystery & Thriller',
    description: 'Suspenseful and mysterious stories',
    slug: 'mystery-thriller',
    image: '/categories/mystery.jpg',
    bookCount: 842,
  },
  {
    _id: '3',
    name: 'Science Fiction & Fantasy',
    description: 'Imaginative and futuristic stories',
    slug: 'sci-fi-fantasy',
    image: '/categories/scifi.jpg',
    bookCount: 756,
  },
  {
    _id: '4',
    name: 'Romance',
    description: 'Love stories and romantic fiction',
    slug: 'romance',
    image: '/categories/romance.jpg',
    bookCount: 634,
  },
  {
    _id: '5',
    name: 'Non-Fiction',
    description: 'Real-world topics and factual content',
    slug: 'non-fiction',
    image: '/categories/non-fiction.jpg',
    bookCount: 923,
  },
  {
    _id: '6',
    name: 'History',
    description: 'Historical events and biographies',
    slug: 'history',
    image: '/categories/history.jpg',
    bookCount: 445,
  },
  {
    _id: '7',
    name: 'Business',
    description: 'Business and entrepreneurship',
    slug: 'business',
    image: '/categories/business.jpg',
    bookCount: 312,
  },
  {
    _id: '8',
    name: 'Self-Help',
    description: 'Personal development and motivation',
    slug: 'self-help',
    image: '/categories/self-help.jpg',
    bookCount: 287,
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    _id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'BUYER',
    avatar: '/avatars/john-doe.jpg',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15'),
    wishlist: ['1', '3', '5'],
  },
  {
    _id: '2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'SELLER',
    avatar: '/avatars/jane-smith.jpg',
    storeName: 'Classic Books Store',
    storeDescription: 'Specializing in classic literature and rare books',
    verified: true,
    createdAt: new Date('2022-06-20'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    _id: '3',
    email: 'admin@bookstore.com',
    name: 'Admin User',
    role: 'ADMIN',
    avatar: '/avatars/admin.jpg',
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
];

// Mock Books
export const mockBooks: Book[] = [
  {
    _id: '1',
    title: 'Harry Potter and the Philosopher\'s Stone',
    description: 'The first book in the Harry Potter series follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday.',
    isbn: '9780747532699',
    authorId: '1',
    author: mockAuthors[0],
    publisherId: '1',
    publisher: mockPublishers[0],
    categoryId: '3',
    category: mockCategories[2],
    price: 12.99,
    originalPrice: 15.99,
    discount: 19,
    stock: 50,
    images: ['/books/harry-potter-1-1.jpg', '/books/harry-potter-1-2.jpg'],
    thumbnail: '/books/harry-potter-1-thumb.jpg',
    format: 'PAPERBACK',
    language: 'English',
    pages: 223,
    publishedYear: 1997,
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.8,
    reviewCount: 15420,
    tags: ['magic', 'wizards', 'adventure', 'young adult'],
    featured: true,
    bestseller: true,
    newRelease: false,
    status: 'ACTIVE',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    _id: '2',
    title: 'The Shining',
    description: 'A masterpiece of horror fiction about Jack Torrance, who becomes winter caretaker of the isolated Overlook Hotel.',
    isbn: '9780307743657',
    authorId: '2',
    author: mockAuthors[1],
    publisherId: '2',
    publisher: mockPublishers[1],
    categoryId: '2',
    category: mockCategories[1],
    price: 14.99,
    stock: 32,
    images: ['/books/shining-1.jpg', '/books/shining-2.jpg'],
    thumbnail: '/books/shining-thumb.jpg',
    format: 'HARDCOVER',
    language: 'English',
    pages: 447,
    publishedYear: 1977,
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.6,
    reviewCount: 8934,
    tags: ['horror', 'psychological thriller', 'isolation'],
    featured: false,
    bestseller: true,
    newRelease: false,
    status: 'ACTIVE',
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    _id: '3',
    title: 'Murder on the Orient Express',
    description: 'Hercule Poirot investigates a murder aboard the famous Orient Express train.',
    isbn: '9780062693662',
    authorId: '3',
    author: mockAuthors[2],
    publisherId: '2',
    publisher: mockPublishers[1],
    categoryId: '2',
    category: mockCategories[1],
    price: 11.99,
    stock: 28,
    images: ['/books/orient-express-1.jpg'],
    thumbnail: '/books/orient-express-thumb.jpg',
    format: 'PAPERBACK',
    language: 'English',
    pages: 256,
    publishedYear: 1934,
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.7,
    reviewCount: 12456,
    tags: ['mystery', 'detective', 'classic', 'whodunit'],
    featured: true,
    bestseller: false,
    newRelease: false,
    status: 'ACTIVE',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    _id: '4',
    title: '1984',
    description: 'A dystopian novel about totalitarian control and surveillance in a future society.',
    isbn: '9780452284234',
    authorId: '4',
    author: mockAuthors[3],
    publisherId: '1',
    publisher: mockPublishers[0],
    categoryId: '1',
    category: mockCategories[0],
    price: 13.99,
    stock: 45,
    images: ['/books/1984-1.jpg'],
    thumbnail: '/books/1984-thumb.jpg',
    format: 'PAPERBACK',
    language: 'English',
    pages: 328,
    publishedYear: 1949,
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.9,
    reviewCount: 23567,
    tags: ['dystopian', 'political', 'surveillance', 'classic'],
    featured: true,
    bestseller: true,
    newRelease: false,
    status: 'ACTIVE',
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    _id: '5',
    title: 'Pride and Prejudice',
    description: 'A romantic novel following Elizabeth Bennet and her complex relationship with Mr. Darcy.',
    isbn: '9780141439518',
    authorId: '5',
    author: mockAuthors[4],
    publisherId: '1',
    publisher: mockPublishers[0],
    categoryId: '4',
    category: mockCategories[3],
    price: 10.99,
    stock: 38,
    images: ['/books/pride-prejudice-1.jpg'],
    thumbnail: '/books/pride-prejudice-thumb.jpg',
    format: 'PAPERBACK',
    language: 'English',
    pages: 432,
    publishedYear: 1813,
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.8,
    reviewCount: 18923,
    tags: ['romance', 'classic', 'regency', 'social commentary'],
    featured: false,
    bestseller: true,
    newRelease: false,
    status: 'ACTIVE',
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2024-01-05'),
  },
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    _id: '1',
    bookId: '1',
    book: mockBooks[0],
    userId: '1',
    user: mockUsers[0],
    rating: 5,
    title: 'Magical and captivating',
    comment: 'This book transported me to a magical world. J.K. Rowling\'s writing is exceptional and the characters are unforgettable.',
    helpful: 234,
    notHelpful: 12,
    verified: true,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-01'),
  },
  {
    _id: '2',
    bookId: '1',
    userId: '3',
    user: mockUsers[2],
    rating: 4,
    title: 'Great start to the series',
    comment: 'While it\'s more aimed at younger readers, the world-building is excellent and sets up the series perfectly.',
    helpful: 156,
    notHelpful: 23,
    verified: true,
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-15'),
  },
  {
    _id: '3',
    bookId: '2',
    userId: '1',
    user: mockUsers[0],
    rating: 5,
    title: 'Terrifyingly brilliant',
    comment: 'Stephen King at his absolute best. This book will keep you up at night, but you won\'t be able to put it down.',
    helpful: 189,
    notHelpful: 8,
    verified: true,
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2023-10-20'),
  },
];

// Mock Addresses
export const mockAddresses: Address[] = [
  {
    _id: '1',
    userId: '1',
    name: 'John Doe',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    phone: '+1-555-123-4567',
    isDefault: true,
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    _id: '1',
    userId: '1',
    user: mockUsers[0],
    items: [
      {
        _id: '1',
        orderId: '1',
        bookId: '1',
        book: mockBooks[0],
        quantity: 1,
        price: 12.99,
        totalPrice: 12.99,
      },
      {
        _id: '2',
        orderId: '1',
        bookId: '3',
        book: mockBooks[2],
        quantity: 2,
        price: 11.99,
        totalPrice: 23.98,
      },
    ],
    totalAmount: 36.97,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'Credit Card',
    shippingAddress: mockAddresses[0],
    trackingNumber: 'TRK123456789',
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-22'),
  },
];

// Helper functions to get mock data
export const getMockBooks = (filters?: {
  category?: string;
  featured?: boolean;
  bestseller?: boolean;
  newRelease?: boolean;
  limit?: number;
}) => {
  let books = [...mockBooks];
  
  if (filters) {
    if (filters.category) {
      books = books.filter(book => book.category.slug === filters.category);
    }
    if (filters.featured !== undefined) {
      books = books.filter(book => book.featured === filters.featured);
    }
    if (filters.bestseller !== undefined) {
      books = books.filter(book => book.bestseller === filters.bestseller);
    }
    if (filters.newRelease !== undefined) {
      books = books.filter(book => book.newRelease === filters.newRelease);
    }
    if (filters.limit) {
      books = books.slice(0, filters.limit);
    }
  }
  
  return books;
};

export const getMockBookById = (id: string) => {
  return mockBooks.find(book => book._id === id);
};

export const getMockReviewsByBookId = (bookId: string) => {
  return mockReviews.filter(review => review.bookId === bookId);
};

export const getMockOrdersByUserId = (userId: string) => {
  return mockOrders.filter(order => order.userId === userId);
};

export const getMockUserById = (id: string) => {
  return mockUsers.find(user => user.id === id);
};