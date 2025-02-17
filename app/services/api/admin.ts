import apiClient from "../api-client";
import { Student } from "./students";
import { Product } from "../../types/product";
import { Orders } from "./orders";
import { AdminDashboardData, UserManagementData, UserManagementFilters } from '../../types/admin';
import { AxiosResponse } from "axios";

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

export const adminApi = {
  // Dashboard Statistics
  getDashboardData: (): Promise<AdminDashboardData> =>
    apiClient.get<AdminDashboardData>('/api/admin/dashboard').then(response => response.data),

  // User Management
  getUsers: (filters?: UserManagementFilters): Promise<{
    results: Student[];
    total: number;
    page: number;
    total_pages: number;
  }> => {
    return apiClient.get<{
      results: Student[];
      total: number;
      page: number;
      total_pages: number;
    }>("/admin/users/", { params: filters }).then(response => response.data);
  },

  updateUserStatus: (userId: number, status: string): Promise<void> =>
    apiClient.put<void>(`/api/admin/users/${userId}/status`, { status }).then(() => {}),

  suspendUser: async (userId: number, reason: string): Promise<any> => {
    const response = await apiClient.post(`/admin/users/${userId}/suspend/`, {
      reason,
    });
    return response.data;
  },

  activateUser: async (userId: number): Promise<any> => {
    const response = await apiClient.post(`/admin/users/${userId}/activate/`);
    return response.data;
  },

  // Product Management
  getProducts: async (params?: {
    status?: "active" | "reported" | "suspended";
    category?: string;
    search?: string;
    page?: number;
  }): Promise<{
    results: Product[];
    total: number;
    page: number;
  }> => {
    const response = await apiClient.get<{
      results: Product[];
      total: number;
      page: number;
    }>("/admin/products/", { params });
    return response.data;
  },

  removeProduct: async (productId: number, reason: string): Promise<void> => {
    await apiClient.post(`/admin/products/${productId}/remove/`, { reason });
  },

  // Order Management
  getOrders: async (params?: {
    status?: Orders["status"];
    payment_status?: "pending" | "completed" | "failed";
    start_date?: string;
    end_date?: string;
    page?: number;
  }): Promise<{
    results: Orders[];
    total: number;
    page: number;
  }> => {
    const response = await apiClient.get<{
      results: Orders[];
      total: number;
      page: number;
    }>("/admin/orders/", { params });
    return response.data;
  },

  // Verification Requests
  getVerificationRequests: async (params?: {
    status?: "pending" | "approved" | "rejected";
    page?: number;
  }): Promise<any> => {
    const response = await apiClient.get("/admin/verifications/", { params });
    return response.data;
  },

  handleVerificationRequest: async (
    requestId: number,
    action: "approve" | "reject",
    reason?: string
  ): Promise<any> => {
    const response = await apiClient.post(
      `/admin/verifications/${requestId}/${action}/`,
      { reason }
    );
    return response.data;
  },

  // Reports Management
  getReports: async (params?: {
    type?: "user" | "product" | "review";
    status?: "pending" | "resolved";
    page?: number;
  }): Promise<any> => {
    const response = await apiClient.get("/admin/reports/", { params });
    return response.data;
  },

  handleReport: async (
    reportId: number,
    action: "resolve" | "dismiss",
    notes?: string
  ): Promise<any> => {
    const response = await apiClient.post(
      `/admin/reports/${reportId}/${action}/`,
      { notes }
    );
    return response.data;
  },

  // System Settings
  getSystemSettings: async (): Promise<any> => {
    const response = await apiClient.get("/admin/settings/");
    return response.data;
  },

  updateSystemSettings: async (settings: {
    maintenance_mode?: boolean;
    registration_enabled?: boolean;
    max_file_size?: number;
    allowed_file_types?: string[];
    notification_settings?: Record<string, boolean>;
  }): Promise<any> => {
    const response = await apiClient.put("/admin/settings/", settings);
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: {
    user_id?: number;
    action?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }): Promise<any> => {
    const response = await apiClient.get("/admin/audit-logs/", { params });
    return response.data;
  },

  // Analytics
  getAnalytics: async (params: {
    metric: "users" | "orders" | "revenue" | "products";
    period: "day" | "week" | "month" | "year";
    start_date?: string;
    end_date?: string;
  }): Promise<any> => {
    const response = await apiClient.get("/admin/analytics/", { params });
    return response.data;
  },

  // System Health
  getSystemHealth: async (): Promise<any> => {
    const response = await apiClient.get("/admin/system/health/");
    return response.data;
  },

  // Backup Management
  createBackup: async (): Promise<any> => {
    const response = await apiClient.post("/admin/system/backup/");
    return response.data;
  },

  restoreBackup: async (backupId: string): Promise<any> => {
    const response = await apiClient.post(`/admin/system/restore/${backupId}/`);
    return response.data;
  },
};