const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  bookCount?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalCategories: number;
  };
}

class CategoriesAPI {
  async getCategories(): Promise<CategoriesResponse> {
    const response = await fetch(`${API_BASE}/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  async getCategory(id: string): Promise<Category> {
    const response = await fetch(`${API_BASE}/categories/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }

    const data = await response.json();
    return data.category;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await fetch(`${API_BASE}/categories/slug/${slug}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }

    const data = await response.json();
    return data.category;
  }
}

export const categoriesAPI = new CategoriesAPI();
export const { getCategories, getCategory, getCategoryBySlug } = categoriesAPI;