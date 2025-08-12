const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Book {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  isbn: string;
  authorId: string;
  author?: Author;
  publisherId: string;
  publisher?: Publisher;
  categoryId: string;
  category?: Category;
  sellerId: string;
  seller?: User;
  price: number;
  originalPrice?: number;
  discount: number;
  stock: number;
  images: string[];
  thumbnail: string;
  format: 'HARDCOVER' | 'PAPERBACK' | 'EBOOK' | 'AUDIOBOOK';
  language: string;
  pages?: number;
  publishedYear: number;
  tags: string[];
  featured: boolean;
  bestseller: boolean;
  newRelease: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  viewCount: number;
  salesCount: number;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  image?: string;
  nationality?: string;
  birthYear?: number;
}

export interface Publisher {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  bookCount?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  storeName?: string;
}

export interface BookFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  author?: string;
  publisher?: string;
  minPrice?: number;
  maxPrice?: number;
  format?: string;
  rating?: number;
  featured?: boolean;
  bestseller?: boolean;
  newRelease?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface BookResponse {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalBooks: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters?: {
    categories: Category[];
    authors: Author[];
    publishers: Publisher[];
    priceRange: { min: number; max: number };
  };
}

class BooksAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async getBooks(filters: BookFilters = {}): Promise<BookResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/books?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    return response.json();
  }

  async getBook(id: string): Promise<Book> {
    const response = await fetch(`${API_BASE}/books/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }

    const data = await response.json();
    return data.book;
  }

  async getBookBySlug(slug: string): Promise<Book> {
    const response = await fetch(`${API_BASE}/books/slug/${slug}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }

    const data = await response.json();
    return data.book;
  }

  async createBook(bookData: Partial<Book>): Promise<Book> {
    const response = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create book');
    }

    const data = await response.json();
    return data.book;
  }

  async updateBook(id: string, bookData: Partial<Book>): Promise<Book> {
    const response = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update book');
    }

    const data = await response.json();
    return data.book;
  }

  async deleteBook(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete book');
    }
  }

  async getSellerBooks(sellerId?: string, filters: BookFilters = {}): Promise<BookResponse> {
    const params = new URLSearchParams();
    
    if (sellerId) {
      params.append('seller', sellerId);
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/books?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch seller books');
    }

    return response.json();
  }

  async updateStock(id: string, stock: number): Promise<Book> {
    const response = await fetch(`${API_BASE}/books/${id}/stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ stock }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update stock');
    }

    const data = await response.json();
    return data.book;
  }
}

// Export a singleton instance
export const booksAPI = new BooksAPI();

// Export individual functions for convenience
export const {
  getBooks,
  getBook,
  getBookBySlug,
  createBook,
  updateBook,
  deleteBook,
  getSellerBooks,
  updateStock,
} = booksAPI;