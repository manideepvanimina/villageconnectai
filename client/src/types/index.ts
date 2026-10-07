export type Language = 'en' | 'te' | 'hi';
export type UserRole = 'villager' | 'farmer' | 'worker' | 'business' | 'moderator' | 'admin';

export interface Village {
  id: string;
  name: string;
  district: string;
  state: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  formatted_address?: string;
  population?: number;
}

export interface Service {
  id: string;
  village_id: string;
  category: string;
  business_name: string;
  provider_name: string;
  contact_number: string;
  whatsapp_number?: string;
  details: string;
  rate_amount: number;
  pricing_unit: string;
  availability_status: 'available' | 'busy' | 'booked' | 'unavailable';
  rating: number;
  rating_count: number;
  is_verified: boolean;
  experience_years?: number;
  service_radius_km?: number;
  village?: Village;
}

export interface Product {
  id: string;
  village_id: string;
  title: string;
  price: number;
  price_unit: string;
  description: string;
  image_url?: string;
  category: string;
  quantity?: string;
  contact_phone: string;
  seller_name: string;
  is_organic: boolean;
  status: 'active' | 'sold' | 'expired';
  village?: Village;
  created_at: string;
}

export interface Update {
  id: string;
  village_id: string;
  author_name: string;
  title: string;
  content: string;
  category: 'notice' | 'event' | 'emergency' | 'lost_found' | 'general';
  image_url?: string;
  is_emergency: boolean;
  status: 'pending' | 'live' | 'rejected' | 'archived';
  verification_count: number;
  verifications_required: number;
  village?: Village;
  created_at: string;
}

export interface GovernmentScheme {
  id: string;
  title: string;
  title_te?: string;
  title_hi?: string;
  category: string;
  benefits: string;
  eligibility: string;
  how_to_apply: string;
  official_portal_url: string;
  helpline_number?: string;
  last_verified_date: string;
}

export interface SmartSearchResult {
  query: string;
  intent: string;
  category: string;
  entities: Record<string, string>;
  village: { id: string; name: string };
  toolCalls: Array<{ tool: string; parameters: Record<string, any> }>;
  results: any[];
  explanation: string;
  recommendedActions: Array<{ type: string; label: string; action: string }>;
  confidence: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  phone_number: string | null;
  full_name: string;
  username: string | null;
  email: string | null;
  bio: string | null;
  address: string | null;
  avatar_url: string | null;
  home_village_id: string | null;
  village?: Village;
  language: Language;
  role: UserRole;
  reputation_score: number;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DemoUser {
  id: string;
  full_name: string;
  username: string;
  phone_number: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  address: string | null;
  home_village_id: string;
  village?: { id: string; name: string; district: string };
}

