// Simple API client for JWT authentication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get JWT token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Generic API request function with JWT support
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => 
    apiRequest<{ message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'BUYER' | 'SELLER';
    storeName?: string;
    storeDescription?: string;
  }) => 
    apiRequest<{ message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  getCurrentUser: () => 
    apiRequest<{ user: any }>('/auth/me'),
    
  updateProfile: (profileData: any) => 
    apiRequest<{ message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
    
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
    apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    }),
};

// Books API
export const booksAPI = {
  getBooks: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    author?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    
    return apiRequest<{
      books: any[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/books${queryString}`);
  },
  
  getBook: (id: string) => 
    apiRequest<{ book: any }>(`/books/${id}`),
    
  createBook: (bookData: any) =>
    apiRequest<{ message: string; book: any }>('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),
    
  updateBook: (id: string, bookData: any) =>
    apiRequest<{ message: string; book: any }>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    }),
    
  deleteBook: (id: string) =>
    apiRequest<{ message: string }>(`/books/${id}`, {
      method: 'DELETE',
    }),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => 
    apiRequest<{ categories: any[] }>('/categories'),
    
  getCategory: (id: string) => 
    apiRequest<{ category: any }>(`/categories/${id}`),
    
  getCategoryBySlug: (slug: string) =>
    apiRequest<{ category: any }>(`/categories/slug/${slug}`),
};

// Authors API
export const authorsAPI = {
  getAuthors: () => 
    apiRequest<{ authors: any[] }>('/authors'),
    
  getAuthor: (id: string) => 
    apiRequest<{ author: any }>(`/authors/${id}`),
};

// Publishers API
export const publishersAPI = {
  getPublishers: () => 
    apiRequest<{ publishers: any[] }>('/publishers'),
    
  getPublisher: (id: string) => 
    apiRequest<{ publisher: any }>(`/publishers/${id}`),
};

// Orders API
export const ordersAPI = {
  getUserOrders: () => 
    apiRequest<{ orders: any[] }>('/orders/user'),
    
  getSellerOrders: () => 
    apiRequest<{ orders: any[] }>('/orders/seller'),
    
  getOrder: (id: string) => 
    apiRequest<{ order: any }>(`/orders/${id}`),
    
  createOrder: (orderData: any) =>
    apiRequest<{ message: string; order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
    
  updateOrderStatus: (id: string, status: string, trackingNumber?: string) =>
    apiRequest<{ message: string; order: any }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, trackingNumber }),
    }),
};

// Cart API
export const cartAPI = {
  getCart: () => 
    apiRequest<{ cart: any }>('/cart'),
    
  addToCart: (bookId: string, quantity: number = 1) =>
    apiRequest<{ message: string; cart: any }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ bookId, quantity }),
    }),
    
  updateCartItem: (bookId: string, quantity: number) =>
    apiRequest<{ message: string; cart: any }>(`/cart/items/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
    
  removeFromCart: (bookId: string) =>
    apiRequest<{ message: string }>(`/cart/items/${bookId}`, {
      method: 'DELETE',
    }),
    
  clearCart: () =>
    apiRequest<{ message: string }>('/cart', {
      method: 'DELETE',
    }),
};

// Sellers API
export const sellersAPI = {
  getSellers: (params?: { page?: number; limit?: number; search?: string; verified?: boolean }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    
    return apiRequest<{
      sellers: any[];
      pagination: any;
    }>(`/sellers${queryString}`);
  },
  
  getSeller: (id: string) => 
    apiRequest<{ seller: any }>(`/sellers/${id}`),
    
  updateProfile: (profileData: any) =>
    apiRequest<{ message: string; seller: any }>('/sellers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
    
  getSellerStats: () =>
    apiRequest<{ stats: any }>('/sellers/dashboard/stats'),
    
  getSellerOrders: (params?: { page?: number; status?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    
    return apiRequest<{
      orders: any[];
      pagination: any;
    }>(`/sellers/dashboard/orders${queryString}`);
  },
};

// Reviews API
export const reviewsAPI = {
  getBookReviews: (bookId: string, params?: { page?: number; limit?: number }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    
    return apiRequest<{
      reviews: any[];
      pagination: any;
    }>(`/reviews/book/${bookId}${queryString}`);
  },
  
  createReview: (reviewData: any) =>
    apiRequest<{ message: string; review: any }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
    
  updateReview: (id: string, reviewData: any) =>
    apiRequest<{ message: string; review: any }>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),
    
  deleteReview: (id: string) =>
    apiRequest<{ message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    }),
};

// Upload API
export const uploadAPI = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiRequest<{ message: string; url: string; publicId: string }>('/upload/single', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary
      body: formData,
    });
  },
  
  uploadBookImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    return apiRequest<{ 
      message: string; 
      images: Array<{ url: string; publicId: string }> 
    }>('/upload/book', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary
      body: formData,
    });
  },
  
  deleteImage: (publicId: string) =>
    apiRequest<{ message: string }>(`/upload/${publicId}`, {
      method: 'DELETE',
    }),
};

// Users API (Admin)
export const usersAPI = {
  getUsers: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    role?: string;
    isActive?: boolean;
  }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    
    return apiRequest<{
      users: any[];
      pagination: any;
    }>(`/users${queryString}`);
  },
  
  getUser: (id: string) => 
    apiRequest<{ user: any }>(`/users/${id}`),
    
  updateUser: (id: string, userData: any) =>
    apiRequest<{ message: string; user: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
    
  addAddress: (userId: string, addressData: any) =>
    apiRequest<{ message: string; address: any }>(`/users/${userId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),
    
  updateAddress: (userId: string, addressId: string, addressData: any) =>
    apiRequest<{ message: string; address: any }>(`/users/${userId}/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    }),
    
  deleteAddress: (userId: string, addressId: string) =>
    apiRequest<{ message: string }>(`/users/${userId}/addresses/${addressId}`, {
      method: 'DELETE',
    }),
    
  addToWishlist: (userId: string, bookId: string) =>
    apiRequest<{ message: string }>(`/users/${userId}/wishlist/${bookId}`, {
      method: 'POST',
    }),
    
  removeFromWishlist: (userId: string, bookId: string) =>
    apiRequest<{ message: string }>(`/users/${userId}/wishlist/${bookId}`, {
      method: 'DELETE',
    }),
    
  getWishlist: (userId: string) =>
    apiRequest<{ wishlist: any[] }>(`/users/${userId}/wishlist`),
};