import { MarketplaceListing } from "./marketplace";

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity';

export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
}
export interface Review {
  id: number;
  productId: number;
  user: User;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}


export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    images: string[];
}

export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export type UserRole = 'admin' | 'seller' | 'buyer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
} 

export interface SingleResponse<T> {
    data: T;
  }
  
  
  export interface SearchParams {
    query?: string;
    category?: number;
    min_price?: number;
    max_price?: number;
    condition?: string;
    in_stock?: boolean;
    sort_by?: SortOption;
  }

export interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  year: number;
  status: 'active' | 'inactive' | 'graduated';
}

export interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    attachments?: string[];
    read: boolean;
    createdAt: string;
}

export interface Conversation {
    id: number;
    participants: User[];
    lastMessage: Message;
    unreadCount: number;
    updatedAt: string;
}

export interface GroupChat {
    id: number;
    name: string;
    description?: string;
    avatar?: string;
    members: User[];
    admins: User[];
    createdAt: string;
    updatedAt: string;
}

export interface GroupMessage {
    id: number;
    groupId: number;
    sender: User;
    content: string;
    attachments?: string[];
    reactions: MessageReaction[];
    createdAt: string;
}

export interface MessageReaction {
    userId: number;
    emoji: string;
    createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'product_launch' | 'sale' | 'promotion';
  productId?: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'order' | 'payment' | 'system' | 'message';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationQueryParams {
  page?: number;
  pageSize?: number;
  type?: Notification['type'];
  read?: boolean;
}

export interface ReviewQueryParams {
  productId?: number;
  userId?: number;
  minRating?: number;
  maxRating?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchResults {
  products: PaginatedResponse<Product>;
  listings: PaginatedResponse<MarketplaceListing>;
  categories: string[];
  suggestions: string[];
}

export interface SearchParams {
  query?: string;
  filters?: {
      category?: string[];
      priceRange?: [number, number];
      rating?: number;
      availability?: boolean;
  };
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  pageSize?: number;
}