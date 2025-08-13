import {
  Book,
  Category,
  Author,
  Publisher,
  Review,
  Order,
  User,
  Cart,
  BooksResponse,
  CategoriesResponse,
  AuthorsResponse,
  PublishersResponse,
  ReviewsResponse,
  OrdersResponse,
  CartResponse,
  UploadResponse
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
export const getAuthHeaders = async (getToken?: () => Promise<string | null>) => {
  if (typeof window !== 'undefined' && getToken) {
    try {
      const token = await getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
      console.warn('Could not get auth token:', error);
      return {};
    }
  }
  return {};
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  getToken?: () => Promise<string | null>
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const authHeaders = await getAuthHeaders(getToken);
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// API functions

// Auth
export const authAPI = {
  register: (userData: Partial<User>) => apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  getCurrentUser: () => apiRequest<{ user: User }>('/auth/me'),
  
  updateProfile: (profileData: Partial<User>) => apiRequest<User>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
};

// Sellers
export const sellersAPI = {
  registerSeller: (sellerData: {
    clerkId: string;
    email: string;
    name: string;
    storeName: string;
    storeDescription?: string;
  }) => apiRequest<{ success: boolean; message: string; user: User }>('/sellers/register', {
    method: 'POST',
    body: JSON.stringify(sellerData),
  }),
  
  getSellerProfile: (clerkId: string) => apiRequest<{ success: boolean; seller: User }>(`/sellers/profile/${clerkId}`),
  
  updateSellerProfile: (clerkId: string, profileData: {
    name?: string;
    storeName?: string;
    storeDescription?: string;
  }) => apiRequest<{ success: boolean; message: string; seller: User }>(`/sellers/profile/${clerkId}`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
};

// Books
export const booksAPI = {
  getBooks: (params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiRequest<BooksResponse>(`/books${query}`);
  },
  
  getBook: (id: string) => apiRequest<Book>(`/books/${id}`),
  
  createBook: (bookData: Partial<Book>) => apiRequest<Book>('/books', {
    method: 'POST',
    body: JSON.stringify(bookData),
  }),
  
  updateBook: (id: string, bookData: Partial<Book>) => apiRequest<Book>(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData),
  }),
  
  deleteBook: (id: string) => apiRequest<{ message: string }>(`/books/${id}`, {
    method: 'DELETE',
  }),
  
  getBooksByCategory: (categoryId: string, params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiRequest<BooksResponse>(`/books/category/${categoryId}${query}`);
  },
  
  getBooksBySeller: (sellerId: string, params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiRequest<BooksResponse>(`/books/seller/${sellerId}${query}`);
  },
};

// Categories
export const categoriesAPI = {
  getCategories: () => apiRequest<CategoriesResponse>('/categories'),
  
  getCategory: (id: string) => apiRequest<Category>(`/categories/${id}`),
  
  getCategoryBySlug: (slug: string) => apiRequest<Category>(`/categories/slug/${slug}`),
  
  createCategory: (categoryData: Partial<Category>) => apiRequest<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  }),
  
  updateCategory: (id: string, categoryData: Partial<Category>) => apiRequest<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  }),
  
  deleteCategory: (id: string) => apiRequest<{ message: string }>(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Authors
export const authorsAPI = {
  getAuthors: (params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiRequest(`/authors${query}`);
  },
  
  getAuthor: (id: string) => apiRequest(`/authors/${id}`),
  
  getAuthorBySlug: (slug: string) => apiRequest(`/authors/slug/${slug}`),
  
  searchAuthors: (query: string) => apiRequest(`/authors/search/${encodeURIComponent(query)}`),
};

// Publishers
export const publishersAPI = {
  getPublishers: (params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiRequest(`/publishers${query}`);
  },
  
  getPublisher: (id: string) => apiRequest(`/publishers/${id}`),
  
  getPublisherBySlug: (slug: string) => apiRequest(`/publishers/slug/${slug}`),
};

// Reviews
export const reviewsAPI = {
  getBookReviews: (bookId: string, params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiRequest(`/reviews/book/${bookId}${query}`);
  },
  
  getUserReviews: (userId: string, params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiRequest(`/reviews/user/${userId}${query}`);
  },
  
  createReview: (reviewData: any) => apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  }),
  
  updateReview: (id: string, reviewData: any) => apiRequest(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData),
  }),
  
  deleteReview: (id: string) => apiRequest(`/reviews/${id}`, {
    method: 'DELETE',
  }),
  
  markHelpful: (id: string) => apiRequest(`/reviews/${id}/helpful`, {
    method: 'POST',
  }),
  
  markNotHelpful: (id: string) => apiRequest(`/reviews/${id}/not-helpful`, {
    method: 'POST',
  }),
};

// Users
export const usersAPI = {
  getUser: (id: string) => apiRequest(`/users/${id}`),
  
  updateUser: (id: string, userData: any) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  addAddress: (userId: string, addressData: any) => apiRequest(`/users/${userId}/addresses`, {
    method: 'POST',
    body: JSON.stringify(addressData),
  }),
  
  updateAddress: (userId: string, addressId: string, addressData: any) => 
    apiRequest(`/users/${userId}/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    }),
  
  deleteAddress: (userId: string, addressId: string) => 
    apiRequest(`/users/${userId}/addresses/${addressId}`, {
      method: 'DELETE',
    }),
  
  addToWishlist: (userId: string, bookId: string) => 
    apiRequest(`/users/${userId}/wishlist/${bookId}`, {
      method: 'POST',
    }),
  
  removeFromWishlist: (userId: string, bookId: string) => 
    apiRequest(`/users/${userId}/wishlist/${bookId}`, {
      method: 'DELETE',
    }),
  
  getWishlist: (userId: string) => apiRequest(`/users/${userId}/wishlist`),
  
  getSellers: (params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiRequest(`/users/sellers/list${query}`);
  },
};

// Orders
export const ordersAPI = {
  createOrder: (orderData: any) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  getOrder: (id: string) => apiRequest(`/orders/${id}`),
  
  getUserOrders: (userId: string, params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiRequest(`/orders/user/${userId}${query}`);
  },
  
  getSellerOrders: (sellerId: string, params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiRequest(`/orders/seller/${sellerId}${query}`);
  },
  
  updateOrderStatus: (id: string, statusData: any) => apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  }),
  
  addTracking: (id: string, trackingData: any) => apiRequest(`/orders/${id}/tracking`, {
    method: 'PUT',
    body: JSON.stringify(trackingData),
  }),
  
  cancelOrder: (id: string, reason?: string) => apiRequest(`/orders/${id}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }),
};

// Cart
export const cartAPI = {
  getCart: (sessionId?: string) => {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return apiRequest<CartResponse>(`/cart${query}`);
  },
  
  addItem: (itemData: { bookId: string; quantity: number; sessionId?: string }) => 
    apiRequest<CartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),
  
  updateItem: (bookId: string, updateData: { quantity: number; sessionId?: string }) => 
    apiRequest<CartResponse>(`/cart/items/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),
  
  removeItem: (bookId: string, sessionId?: string) => 
    apiRequest<CartResponse>(`/cart/items/${bookId}`, {
      method: 'DELETE',
      body: JSON.stringify(sessionId ? { sessionId } : {}),
    }),
  
  clearCart: (sessionId?: string) => apiRequest<{ message: string }>('/cart', {
    method: 'DELETE',
    body: JSON.stringify(sessionId ? { sessionId } : {}),
  }),
  
  mergeCart: (sessionId: string) => apiRequest<CartResponse>('/cart/merge', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  }),
  
  validateCart: (sessionId?: string) => {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return apiRequest<{ valid: boolean; issues?: string[] }>(`/cart/validate${query}`);
  },
  
  getCartSummary: (sessionId?: string) => {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return apiRequest<{ totalItems: number; totalPrice: number }>(`/cart/summary${query}`);
  },
};

// Upload
export const uploadAPI = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiRequest('/upload/single', {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  },
  
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    return apiRequest('/upload/multiple', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
  
  uploadBookImages: (thumbnail?: File, images?: File[]) => {
    const formData = new FormData();
    if (thumbnail) formData.append('thumbnail', thumbnail);
    if (images) {
      images.forEach(file => formData.append('images', file));
    }
    
    return apiRequest('/upload/book', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiRequest('/upload/avatar', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
  
  deleteImage: (publicId: string) => apiRequest(`/upload/${publicId}`, {
    method: 'DELETE',
  }),
  
  deleteImageByUrl: (url: string) => apiRequest('/upload/delete-by-url', {
    method: 'POST',
    body: JSON.stringify({ url }),
  }),
};

export default {
  auth: authAPI,
  sellers: sellersAPI,
  books: booksAPI,
  categories: categoriesAPI,
  authors: authorsAPI,
  publishers: publishersAPI,
  reviews: reviewsAPI,
  users: usersAPI,
  orders: ordersAPI,
  cart: cartAPI,
  upload: uploadAPI,
};