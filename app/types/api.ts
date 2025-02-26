export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
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


export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface AuthTokens {
  refreshToken: string;
  token: string;
  user_id: number;
  email: string;
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
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface TwoFactorAuthResponse {
  secret: string;
  qrCodeUrl: string;
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
}

export interface SingleResponse<T> {
  data: T;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

