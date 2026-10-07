import { Village, Service, Product, Update, GovernmentScheme, SmartSearchResult, Language, UserProfile, DemoUser } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // -------------------------------------------------------------------
  // Authentication & Profile Management
  // -------------------------------------------------------------------
  async getDemoUsers(): Promise<DemoUser[]> {
    const res = await fetch(`${API_BASE_URL}/api/auth/demo-users`);
    if (!res.ok) throw new Error('Failed to fetch demo users');
    return res.json();
  },

  async getMyProfile(token: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/api/profile/me`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch user profile');
    }
    return res.json();
  },

  async getProfileById(id: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/api/profiles/${id}`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(data: Partial<UserProfile>, token: string): Promise<{ success: boolean; message: string; profile: UserProfile }> {
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update profile');
    }
    return res.json();
  },

  async uploadAvatar(imageBase64: string, mimeType: string, token: string): Promise<{ success: boolean; message: string; avatar_url: string; profile: UserProfile }> {
    const res = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload profile picture');
    }
    return res.json();
  },

  async removeAvatar(token: string): Promise<{ success: boolean; message: string; avatar_url: null; profile: UserProfile }> {
    const res = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to remove profile picture');
    }
    return res.json();
  },

  // -------------------------------------------------------------------
  // Villages
  // -------------------------------------------------------------------
  async getVillages(): Promise<Village[]> {
    const res = await fetch(`${API_BASE_URL}/api/villages`);
    if (!res.ok) throw new Error('Failed to fetch villages');
    return res.json();
  },

  // -------------------------------------------------------------------
  // Services / Directory
  // -------------------------------------------------------------------
  async getServices(params?: { village_id?: string; category?: string; search?: string; availability?: string }): Promise<Service[]> {
    const query = new URLSearchParams();
    if (params?.village_id) query.append('village_id', params.village_id);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.availability) query.append('availability', params.availability);

    const res = await fetch(`${API_BASE_URL}/api/services?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  async addService(data: Partial<Service>, token?: string): Promise<Service> {
    const res = await fetch(`${API_BASE_URL}/api/services`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create service');
    return res.json();
  },

  // -------------------------------------------------------------------
  // Products / Marketplace
  // -------------------------------------------------------------------
  async getProducts(params?: { village_id?: string; category?: string; search?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.village_id) query.append('village_id', params.village_id);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async addProduct(data: Partial<Product>, token?: string): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create product listing');
    return res.json();
  },

  // -------------------------------------------------------------------
  // Community Updates & Peer Verification
  // -------------------------------------------------------------------
  async getUpdates(village_id?: string): Promise<Update[]> {
    const query = village_id ? `?village_id=${village_id}` : '';
    const res = await fetch(`${API_BASE_URL}/api/updates${query}`);
    if (!res.ok) throw new Error('Failed to fetch updates');
    return res.json();
  },

  async addUpdate(data: Partial<Update>, token?: string): Promise<Update> {
    const res = await fetch(`${API_BASE_URL}/api/updates`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create community update');
    return res.json();
  },

  async verifyUpdate(updateId: string, token?: string, userId?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/updates/${updateId}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Verification failed');
    }
    return res.json();
  },

  // -------------------------------------------------------------------
  // Government Schemes
  // -------------------------------------------------------------------
  async getGovernmentSchemes(): Promise<GovernmentScheme[]> {
    const res = await fetch(`${API_BASE_URL}/api/government-schemes`);
    if (!res.ok) throw new Error('Failed to fetch government schemes');
    return res.json();
  },

  // -------------------------------------------------------------------
  // AI Smart Search Agent
  // -------------------------------------------------------------------
  async smartSearch(query: string, village_id: string, language: Language = 'en'): Promise<SmartSearchResult> {
    const res = await fetch(`${API_BASE_URL}/api/ai/smart-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, village_id, language }),
    });
    if (!res.ok) throw new Error('Smart Search agent failed');
    return res.json();
  },

  // -------------------------------------------------------------------
  // AI Assistant Chat
  // -------------------------------------------------------------------
  async chatAI(message: string, village_id: string, language: Language = 'en'): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, village_id, language }),
    });
    if (!res.ok) throw new Error('AI chat failed');
    return res.json();
  },
};

// Voice Speech Synthesis (Text to Speech in local Indian languages)
export function speakText(text: string, language: Language = 'en') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/[*#•]/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.95;
  if (language === 'te') utterance.lang = 'te-IN';
  else if (language === 'hi') utterance.lang = 'hi-IN';
  else utterance.lang = 'en-IN';
  window.speechSynthesis.speak(utterance);
}
