import { Venture, VentureMetrics } from '../types/venture';
import { getBackendUrl } from '../utils/backendUrl';

const API_BASE = `${getBackendUrl()}/api/ventures`;

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

class VentureService {
  // Get all ventures
  async getVentures(): Promise<Venture[]> {
    const response = await fetch(API_BASE, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/';
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch ventures');
    }
    
    return response.json();
  }

  // Get venture by ID
  async getVentureById(id: number | string): Promise<Venture | undefined> {
    const response = await fetch(`${API_BASE}/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error('Failed to fetch venture');
    }
    
    return response.json();
  }

  // Get ventures by status
  async getVenturesByStatus(status: string): Promise<Venture[]> {
    const ventures = await this.getVentures();
    return ventures.filter(v => v.status === status);
  }

  // Get venture metrics
  async getMetrics(): Promise<VentureMetrics> {
    const response = await fetch(`${API_BASE}/metrics`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }
    
    return response.json();
  }

  // Create new venture
  async createVenture(ventureData: Omit<Venture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Venture> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ventureData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create venture');
    }
    
    return response.json();
  }

  // Update venture
  async updateVenture(id: number | string, updates: Partial<Venture>): Promise<Venture | undefined> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error('Failed to update venture');
    }
    
    return response.json();
  }

  // Delete venture
  async deleteVenture(id: number | string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return response.ok;
  }

  // Search ventures
  async searchVentures(query: string): Promise<Venture[]> {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to search ventures');
    }
    
    return response.json();
  }
}

export const ventureService = new VentureService();
