# Book E-Commerce Platform - Complete Implementation Guide

## Overview

This is a comprehensive book e-commerce platform built with modern technologies, featuring separate buyer and seller dashboards, authentication via Clerk, image hosting with Cloudinary, and a robust Express.js backend with MongoDB.

## Architecture

### Frontend (Next.js 15 + TypeScript)
- **Framework**: Next.js 15 with App Router
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Clerk
- **State Management**: React hooks and context
- **Image Handling**: Cloudinary integration

### Backend (Express.js + MongoDB)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk JWT verification
- **Image Upload**: Cloudinary + Multer
- **API**: RESTful endpoints with comprehensive CRUD operations

## Project Structure

```
W:\StemLink\Final\
├── fe/                          # Frontend (Next.js)
│   ├── app/                     # App Router pages
│   │   ├── layout.tsx          # Root layout with ClerkProvider
│   │   ├── page.tsx            # Landing page
│   │   ├── sign-in/            # Clerk sign-in pages
│   │   └── sign-up/            # Clerk sign-up pages
│   ├── components/             # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── layout/             # Layout components
│   ├── lib/                    # Utilities and API clients
│   │   ├── api.ts              # API client functions
│   │   └── mock-data.ts        # Mock data for development
│   └── middleware.ts           # Clerk authentication middleware
├── be/                         # Backend (Express.js)
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API route handlers
│   ├── middleware/             # Custom middleware
│   └── server.js              # Main server file
└── doc/                        # Documentation
    └── requirement.md          # Project requirements
```

## Database Schema

### User Model
```javascript
{
  clerkId: String (required, unique),
  email: String (required, unique),
  firstName: String,
  lastName: String,
  role: Enum ['BUYER', 'SELLER', 'ADMIN'],
  addresses: [AddressSchema],
  wishlist: [ObjectId],
  avatar: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Book Model
```javascript
{
  title: String (required),
  slug: String (unique),
  author: ObjectId (ref: 'Author'),
  publisher: ObjectId (ref: 'Publisher'),
  category: ObjectId (ref: 'Category'),
  seller: ObjectId (ref: 'User'),
  isbn: String,
  description: String,
  price: Number (required),
  discountPrice: Number,
  stock: Number,
  images: [String],
  thumbnail: String,
  status: Enum ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  tags: [String],
  language: String,
  pages: Number,
  weight: Number,
  dimensions: Object,
  isActive: Boolean,
  averageRating: Number,
  totalReviews: Number,
  salesCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  orderNumber: String (unique),
  user: ObjectId (ref: 'User'),
  items: [OrderItemSchema],
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  totalAmount: Number,
  taxAmount: Number,
  shippingCost: Number,
  discountAmount: Number,
  status: Enum ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
  paymentStatus: Enum ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
  paymentMethod: String,
  trackingNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features Implemented

### Authentication & Authorization
- **Clerk Integration**: Complete authentication flow with sign-in/sign-up
- **Role-based Access**: BUYER, SELLER, and ADMIN roles
- **JWT Verification**: Backend middleware for protected routes
- **User Synchronization**: Automatic user creation in MongoDB on first login

### Book Management
- **CRUD Operations**: Full create, read, update, delete for books
- **Image Upload**: Cloudinary integration for book covers and galleries
- **Search & Filtering**: Advanced search with category, author, price filters
- **Inventory Management**: Stock tracking and availability

### Shopping Cart
- **Guest Cart**: Shopping cart functionality without login
- **User Cart**: Persistent cart for authenticated users
- **Cart Merge**: Merge guest cart with user cart on login
- **Real-time Updates**: Dynamic cart updates with validation

### Order Processing
- **Order Creation**: Complete order flow with validation
- **Status Tracking**: Order status updates and tracking
- **Seller Dashboard**: Order management for sellers
- **Buyer Dashboard**: Order history and tracking

### Image Management
- **Cloudinary Integration**: Automatic image optimization
- **Multiple Formats**: Support for various image formats
- **Transformations**: Automatic resizing and optimization
- **CDN Delivery**: Fast image delivery via Cloudinary CDN

## Environment Setup

### Prerequisites
- Node.js 18+
- pnpm package manager
- MongoDB database
- Clerk account
- Cloudinary account

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/book-store
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Installation & Setup

### 1. Clone and Setup
```bash
# Navigate to project directory
cd W:\StemLink\Final

# Install frontend dependencies
cd fe
pnpm install

# Install backend dependencies
cd ../be
pnpm install
```

### 2. Database Setup
```bash
# Start MongoDB service
# MongoDB should be running on mongodb://localhost:27017
# Database name: book-store
```

### 3. Start Development Servers
```bash
# Start backend server (from /be directory)
pnpm run dev
# Server runs on http://localhost:5000

# Start frontend server (from /fe directory)
pnpm run dev
# Frontend runs on http://localhost:3000
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Book Endpoints
- `GET /api/books` - Get all books with filtering
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create new book (Seller/Admin only)
- `PUT /api/books/:id` - Update book (Seller/Admin only)
- `DELETE /api/books/:id` - Delete book (Seller/Admin only)

### Category Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `GET /api/categories/slug/:slug` - Get category by slug

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/seller/:sellerId` - Get seller orders

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:bookId` - Update cart item
- `DELETE /api/cart/items/:bookId` - Remove item from cart

### Upload Endpoints
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/book` - Upload book images
- `DELETE /api/upload/:publicId` - Delete image

## Key Implementation Details

### Clerk Authentication Flow
1. **Frontend**: ClerkProvider wraps the entire app in layout.tsx:174
2. **Middleware**: Routes are protected using Clerk's authMiddleware in middleware.ts:3
3. **Backend**: JWT tokens verified using Clerk SDK in be/middleware/auth.js
4. **Database**: Users automatically created in MongoDB on first authentication

### Image Upload Process
1. **Frontend**: File selection and preview
2. **API Call**: FormData sent to backend upload endpoint via api.ts:299-355
3. **Multer**: File processing and validation
4. **Cloudinary**: Image upload with transformations
5. **Database**: Image URLs stored in MongoDB

### Cart Management
1. **Guest Users**: Cart stored in localStorage with session ID
2. **Authenticated Users**: Cart stored in MongoDB
3. **Login Merge**: Guest cart merged with user cart on authentication
4. **Real-time Sync**: Cart updates reflected immediately via api.ts:256-296

### Search & Filtering
- **Text Search**: Full-text search across title, description, author
- **Category Filter**: Filter by book categories
- **Price Range**: Min/max price filtering
- **Sorting**: Price, rating, date, popularity sorting
- **Pagination**: Server-side pagination with configurable limits

## Testing

### Backend Testing
```bash
cd be
# Test database connection
node -e "require('./server.js')"

# Test API endpoints
curl http://localhost:5000/api/health
```

### Frontend Testing
```bash
cd fe
# Run development server
pnpm run dev

# Build for production
pnpm run build
```

## Security Features

### Authentication Security
- **JWT Verification**: All protected routes verify Clerk JWT tokens
- **Role-based Access**: Different permissions for buyers, sellers, admins
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute force attacks

### Data Security
- **Environment Variables**: Sensitive data stored in environment files
- **CORS Configuration**: Proper CORS setup for API security
- **Input Sanitization**: Protection against injection attacks
- **File Upload Security**: File type and size validation

## Production Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the Next.js application
2. Configure environment variables
3. Deploy to hosting platform

### Backend Deployment (Railway/Heroku)
1. Set up MongoDB Atlas or cloud database
2. Configure environment variables
3. Deploy Express.js application

### Environment Configuration
- Update API URLs for production
- Set up proper CORS origins
- Configure production Clerk and Cloudinary settings

## Performance Optimizations

### Frontend Optimizations
- **Image Optimization**: Next.js Image component with Cloudinary
- **Code Splitting**: Automatic code splitting with Next.js
- **Lazy Loading**: Lazy loading for non-critical components
- **Caching**: Proper caching strategies for API calls

### Backend Optimizations
- **Database Indexing**: Proper indexes on frequently queried fields
- **Query Optimization**: Efficient MongoDB queries with population
- **Image Processing**: Cloudinary transformations for optimal delivery
- **Compression**: Response compression middleware

## Current Implementation Status

### Completed Features ✅
- Express backend with MongoDB connection
- Complete database schemas for all entities (User, Book, Category, Author, Publisher, Review, Order, Cart)
- Full CRUD API routes for all resources
- Clerk authentication integration (frontend & backend)
- Cloudinary image upload functionality
- Frontend layout with ClerkProvider integration
- Authentication pages (sign-in/sign-up)
- API client with comprehensive endpoint coverage
- Route protection middleware

### Pending Tasks 📋
- Replace mock data with API calls in frontend components
- Test all MongoDB CRUD operations thoroughly
- Implement comprehensive error handling in frontend
- Add loading states throughout the application

## Troubleshooting

### Common Issues

1. **Clerk Authentication Errors**
   - Verify environment variables are set correctly in both fe/.env.local and be/.env
   - Check Clerk dashboard configuration matches middleware.ts:3-19
   - Ensure ClerkProvider is properly configured in layout.tsx:174-181

2. **Database Connection Issues**
   - Verify MongoDB is running on mongodb://localhost:27017
   - Check connection string format in be/.env
   - Ensure database name is "book-store"

3. **Image Upload Failures**
   - Verify Cloudinary credentials in be/.env
   - Check file size and type restrictions in upload middleware
   - Ensure proper multer configuration in be/middleware/upload.js

4. **API Request Failures**
   - Check backend server is running on http://localhost:5000
   - Verify NEXT_PUBLIC_API_URL in fe/.env.local
   - Check CORS configuration in be/server.js

## Next Steps & Enhancements

### Immediate Improvements
- [ ] Replace remaining mock data with API calls
- [ ] Implement comprehensive error handling
- [ ] Add loading states throughout the application
- [ ] Create comprehensive test suite

### Feature Enhancements
- [ ] Payment processing integration (Stripe/PayPal)
- [ ] Advanced search with Elasticsearch
- [ ] Real-time notifications
- [ ] Mobile application
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Advanced recommendation engine

## File References

### Key Frontend Files
- `fe/app/layout.tsx:174-181` - ClerkProvider configuration
- `fe/components/layout/header.tsx:32` - Clerk useUser hook integration
- `fe/lib/api.ts` - Complete API client with all endpoints
- `fe/middleware.ts:3-19` - Route protection configuration

### Key Backend Files
- `be/server.js` - Main Express server setup
- `be/models/` - All MongoDB schemas and models
- `be/routes/` - Complete CRUD API endpoints
- `be/middleware/auth.js` - Clerk authentication middleware

This documentation provides a complete guide for understanding, setting up, and maintaining the book e-commerce platform.