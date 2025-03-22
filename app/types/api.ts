export interface Product {
  id: string | number;
  title?: string;
  name?: string;
  slug: string;
  description: string;
  price: string | number;
  image_url?: string;
  imageUrl?: string;
  category_id: string | number;
  category_name: string;
  student_id: string | number;
  student_name: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  available_stock?: number;
  stock?: number;
  average_rating?: number;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  userId: number;
}

export interface WishlistItem {
  id: number;
  product: Product;
  added_at: string;
}

export interface Wishlist {
  id: number;
  user: number;
  items: WishlistItem[];
}

export interface User {
  id: number;
  email: string;
  username?: string;
  name?: string;
  profile_image?: string;
  is_2fa_enabled?: boolean;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthTokens {
  token?: string;
  access?: string;
  refreshToken?: string;
  refresh?: string;
  user_id: number;
  email: string;
  requires2FA?: boolean;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  requires2FA: boolean;
  verify2FA: (token: string) => Promise<void>;
}

export interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
  is_active: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface TwoFactorAuthResponse {
  secret: string;
  qrCodeUrl: string;
  message?: string;
}

export interface TwoFactorStatusResponse {
  isEnabled: boolean;
  isVerified: boolean;
}

export interface SignInResponse {
  message: string;
  token: string;
}

export interface SignUpResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message?: string;
  token?: string;
}

export interface SingleResponse<T> {
  data: T;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, string[]>;
}

export interface ApiErrorResponseData {
  message?: string,
  code?: string,
  details?: any
}