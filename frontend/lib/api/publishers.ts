const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Publisher {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bookCount?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublishersResponse {
  publishers: Publisher[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalPublishers: number;
  };
}

class PublishersAPI {
  async getPublishers(): Promise<PublishersResponse> {
    const response = await fetch(`${API_BASE}/publishers`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch publishers');
    }

    return response.json();
  }

  async getPublisher(id: string): Promise<Publisher> {
    const response = await fetch(`${API_BASE}/publishers/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch publisher');
    }

    const data = await response.json();
    return data.publisher;
  }

  async getPublisherBySlug(slug: string): Promise<Publisher> {
    const response = await fetch(`${API_BASE}/publishers/slug/${slug}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch publisher');
    }

    const data = await response.json();
    return data.publisher;
  }
}

export const publishersAPI = new PublishersAPI();
export const { getPublishers, getPublisher, getPublisherBySlug } = publishersAPI;