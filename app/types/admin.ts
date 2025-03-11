import { User } from "next-auth";
import { Orders } from "./orders";

export interface AdminDashboardData {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Orders[];
    userStats: UserStats;
}

export interface UserManagementData {
    users: User[];
    totalCount: number;
    pageCount: number;
}

export interface UserManagementFilters {
    search?: string;
    status?: 'active' | 'inactive' | 'pending' | 'all';
    role?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    sortBy?: 'name' | 'email' | 'dateJoined' | 'status';
    sortOrder?: 'asc' | 'desc';
    page?: number; 
    pageSize?: number;
}


export interface UserStats {
    newUsers: number;
    activeUsers: number;
    inactiveUsers: number;
}

export interface UserQueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
} 

export interface AdminStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  active_users: number;
  pending_verifications: number;
  recent_transactions: number;
  system_health: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    response_time: number;
  };
}