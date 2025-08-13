export interface User {
  _id: string;
  clerkId?: string;
  email: string;
  name: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Buyer specific
  addresses?: Address[];
  wishlist?: string[];
  
  // Seller specific
  storeName?: string;
  storeDescription?: string;
  verified?: boolean;
  isActive?: boolean;
}

export interface Address {
  _id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  bookCount?: number;
  isActive?: boolean;
}

export interface Author {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  image?: string;
  nationality?: string;
  birthYear?: number;
  isActive?: boolean;
}

export interface Publisher {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo?: string;
  isActive?: boolean;
}

export interface Book {
  _id: string;
  title: string;
  description: string;
  isbn: string;
  authorId: string;
  author?: Author;
  publisherId: string;
  publisher?: Publisher;
  categoryId: string;
  category?: Category;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  images: string[];
  thumbnail: string;
  format: 'HARDCOVER' | 'PAPERBACK' | 'EBOOK' | 'AUDIOBOOK';
  language: string;
  pages?: number;
  publishedYear: number;
  sellerId: string;
  seller?: User;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  featured?: boolean;
  bestseller?: boolean;
  newRelease?: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  slug?: string;
  viewCount?: number;
  salesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  _id: string;
  bookId: string;
  book?: Book;
  userId: string;
  user?: User;
  rating: number;
  title: string;
  comment: string;
  helpful?: number;
  notHelpful?: number;
  verified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  _id?: string;
  bookId: string;
  book?: Book;
  quantity: number;
  price: number;
  addedAt?: Date;
}

export interface Cart {
  _id?: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  totalItems?: number;
  totalPrice?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  _id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress?: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  _id: string;
  orderId: string;
  bookId: string;
  book: Book;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Wishlist {
  id: string;
  userId: string;
  user: User;
  books: Book[];
  createdAt: Date;
  updatedAt: Date;
}

// Filter and search types
export interface BookFilters {
  category?: string;
  author?: string;
  publisher?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  format?: Book['format'];
  language?: string;
  inStock?: boolean;
}

export interface SortOptions {
  field: 'price' | 'rating' | 'publishedYear' | 'title' | 'createdAt';
  order: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SearchResult<T> {
  data: T[];
  pagination: PaginationInfo;
  filters?: BookFilters;
  sort?: SortOptions;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface BooksResponse {
  books: Book[];
  pagination?: PaginationInfo;
  total?: number;
}

export interface CategoriesResponse {
  categories: Category[];
  total?: number;
}

export interface AuthorsResponse {
  authors: Author[];
  pagination?: PaginationInfo;
  total?: number;
}

export interface PublishersResponse {
  publishers: Publisher[];
  pagination?: PaginationInfo;
  total?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination?: PaginationInfo;
  total?: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination?: PaginationInfo;
  total?: number;
}

export interface CartResponse extends Cart {}

export interface UploadResponse {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
}

// Dashboard types
export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: Order[];
  salesData: SalesData[];
  topProducts: Book[];
}