export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  social_id?: string | null;
  social_provider?: string | null;
  active: boolean;
  avatar: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: number;
  user_id: number;
  tier_name: 'VIP' | 'Regular';
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Discipline {
  id: number;
  name: 'Musculación' | 'Crossfit' | 'Funcional' | 'Spinning';
  slug: string;
  description: string;
  icon: string;
  color: string;
  weekly_classes: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number; // In Bolivianos (Bs.)
  stock: number;
  category: 'supplement' | 'clothing' | 'equipment';
  tags: string[]; // JSON array for dynamic recommendation engine
  image_url: string;
  images: string[]; // Multiple high-res photos for gallery carousel
  rating: number;
  sales_count: number;
  is_active: boolean;
}

export interface StoryItem {
  id: number;
  user_name: string;
  user_avatar: string;
  role: string;
  image_url: string;
  title: string;
  time_ago: string;
  has_unseen: boolean;
}

export interface GymFacility {
  id: number;
  title: string;
  tagline: string;
  description: string;
  image_url: string;
  badge: string;
}

export interface CommunityPost {
  id: number;
  user_id: number;
  user?: User;
  image_url: string;
  caption: string;
  approved_by_admin: boolean;
  likes_count: number;
  is_liked_by_me?: boolean;
  discipline_tag?: string;
  created_at: string;
  webp_optimized_size?: string;
  original_size?: string;
}

export interface FreePass {
  id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  qr_code_token: string;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface LaravelCodeFile {
  id: string;
  filename: string;
  path: string;
  category: 'migration' | 'model' | 'controller' | 'request' | 'notification' | 'route' | 'config';
  description: string;
  code: string;
  features: string[];
}
