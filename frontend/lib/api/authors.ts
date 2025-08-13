const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Author {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  image?: string;
  nationality?: string;
  birthYear?: number;
  bookCount?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorsResponse {
  authors: Author[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalAuthors: number;
  };
}

class AuthorsAPI {
  async getAuthors(): Promise<AuthorsResponse> {
    const response = await fetch(`${API_BASE}/authors`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch authors');
    }

    return response.json();
  }

  async getAuthor(id: string): Promise<Author> {
    const response = await fetch(`${API_BASE}/authors/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch author');
    }

    const data = await response.json();
    return data.author;
  }

  async getAuthorBySlug(slug: string): Promise<Author> {
    const response = await fetch(`${API_BASE}/authors/slug/${slug}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch author');
    }

    const data = await response.json();
    return data.author;
  }
}

export const authorsAPI = new AuthorsAPI();
export const { getAuthors, getAuthor, getAuthorBySlug } = authorsAPI;