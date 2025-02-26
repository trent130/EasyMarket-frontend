import { useEffect, useState } from 'react';
import apiClient from '@/services/api-client';
import { 
    InitiatePaymentInput,
    MpesaPaymentRequest,
    Payment, 
    PaymentIntent, 
    PaymentMethod, 
    PaymentReceipt, 
    PaymentStatus, 
    PaymentVerification, 
    RefundRequest, 
    StatusCacheEntry, 
    Transaction 
  } from '@/types/payment';

// Constants for configuration
const POLL_MAX_ATTEMPTS = 24; // 2 minutes total with exponential backoff
const POLL_MAX_DELAY = 10000; // 10 seconds
const POLL_BASE_DELAY = 1000; // 1 second
const CACHE_TTL = 5000; // Cache valid for 5 seconds

// Error messages
const ERROR_MESSAGES = {
  PAYMENT_TIMEOUT: 'Payment timeout. Please try again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  VERIFICATION_FAILED: 'Failed to verify payment status',
  RECEIPT_FAILED: 'Failed to fetch receipt',
  REFUND_FAILED: 'Refund request failed',
  HISTORY_FAILED: 'Failed to fetch payment history',
} as const;

// Create a singleton cache instance
const statusCache = new Map<string, StatusCacheEntry>();

// Helper function to check if status is final
const isFinalStatus = (status: PaymentStatus): boolean =>
  status === 'completed' || status === 'failed';

export const paymentApi = {
  // Get saved payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<PaymentMethod[]>("/payment/methods/");
    return response.data;
  },

  // Add new payment method
  addPaymentMethod: async (data: {
    type: PaymentMethod["type"];
    details: PaymentMethod["details"];
    is_default?: boolean;
  }): Promise<PaymentMethod> => {
    const response = await apiClient.post<PaymentMethod>(
      "/payment/methods/",
      data
    );
    return response.data;
  },

  // Remove payment method
  removePaymentMethod: async (id: number): Promise<void> => {
    await apiClient.delete<void>(`/payment/methods/${id}/`);
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id: number): Promise<PaymentMethod> => {
    const response = await apiClient.post<PaymentMethod>(
      `/payment/methods/${id}/set-default/`
    );
    return response.data;
  },

  // Initiate payment
  initiatePayment: async (data: InitiatePaymentInput): Promise<{
    transaction_id: string;
    checkout_url?: string;
    mpesa_prompt?: boolean;
  }> => {
    const response = await apiClient.post<{
      transaction_id: string;
      checkout_url?: string;
      mpesa_prompt?: boolean;
    }>("/payment/initiate/", data);
    return response.data;
  },

  // Verify payment status
  verifyPaymentStatus: async (transactionId: string): Promise<{
    status: Transaction["status"];
    message: string;
  }> => {
    const response = await apiClient.get<{
      status: Transaction["status"];
      message: string;
    }>(`/payment/verify/${transactionId}/`);
    return response.data;
  },

  // Get payment history
  getTransactionHistory: async (params?: {
    status?: Transaction["status"];
    start_date?: string;
    end_date?: string;
    page?: number;
  }): Promise<{
    results: Transaction[];
    total: number;
    page: number;
    total_pages: number;
  }> => {
    const response = await apiClient.get<{
      results: Transaction[];
      total: number;
      page: number;
      total_pages: number;
    }>("/payment/transactions/", { params });
    return response.data;
  },

  // Get transaction details
  getTransactionDetails: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(
      `/payment/transactions/${id}/`
    );
    return response.data;
  },

  // Request refund
  requestRefund: async (
    transactionId: string,
    data: {
      reason: string;
      amount?: number;
    }
  ): Promise<{
    refund_id: string;
    status: "pending" | "approved" | "rejected";
    amount: number;
  }> => {
    const response = await apiClient.post<{
      refund_id: string;
      status: "pending" | "approved" | "rejected";
      amount: number;
    }>(`/payment/transactions/${transactionId}/refund/`, data);
    return response.data;
  },

  // Get refund status
  getRefundStatus: async (refundId: string): Promise<{
    status: "pending" | "approved" | "rejected";
    amount: number;
    processed_at?: string;
    reason?: string;
  }> => {
    const response = await apiClient.get<{
      status: "pending" | "approved" | "rejected";
      amount: number;
      processed_at?: string;
      reason?: string;
    }>(`/payment/refunds/${refundId}/`);
    return response.data;
  },

  // Generate payment receipt
  generateReceipt: async (transactionId: string): Promise<Blob> => {
    const response = await apiClient.get(`/payment/transactions/${transactionId}/receipt/`,{ responseType: "blob" });
    return response.data;
  },

  // Validate M-Pesa number
  validateMpesaNumber: async (phoneNumber: string): Promise<{
    valid: boolean;
    formatted_number?: string;
  }> => {
    const response = await apiClient.post<{
      valid: boolean;
      formatted_number?: string;
    }>("/payment/validate-mpesa/", { phone_number: phoneNumber });
    return response.data;
  },

  getPayments: (params?: Record<string, string | number>): Promise<Payment[]> =>
        apiClient.get<Payment[]>("/api/payments", { params }).then(response => response.data),

  getPaymentDetails: (id: number): Promise<Payment> =>
        apiClient.get<Payment>(`/api/payments/${id}`).then(response => response.data),

  createPaymentIntent: (orderId: number, amount: number, currency: string): Promise<PaymentIntent> =>
        apiClient.post<PaymentIntent>("/api/payments/create-intent", { orderId, amount, currency }).then(response => response.data),

  processRefund: (paymentId: number, amount?: number): Promise<any> =>
        apiClient.post(`/api/payments/${paymentId}/refund`, { amount }).then(response => response.data),

  // Initiate M-Pesa payment
  initiateMpesaPayment: async (data: MpesaPaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await apiClient.post<PaymentResponse>('payment/api/payment/mpesa/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || ERROR_MESSAGES.PAYMENT_FAILED);
    }
  },

  // Verify payment status
  verifyPayment: async (data: PaymentVerification): Promise<PaymentResponse> => {
    try {
      const response = await apiClient.post<PaymentResponse>('/payment/api/payment/verify/', data);
      return response.data;
    } catch (error: any) {
   throw new Error(error.response?.data?.error || ERROR_MESSAGES.VERIFICATION_FAILED);
    }
  },

  // Get payment receipt
  getPaymentReceipt: async (transactionId: string): Promise<PaymentReceipt> => {
    try {
      const response = await apiClient.get<PaymentReceipt>(`/payment/api/payment/transactions/${transactionId}/receipt/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || ERROR_MESSAGES.RECEIPT_FAILED);
    }
  },

  // Request refund
  requestRefundPayment: async (transactionId: string, data: RefundRequest): Promise<PaymentResponse> => {
    try {
      const response = await apiClient.post<PaymentResponse>(`payment/api/payment/${transactionId}/refund/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || ERROR_MESSAGES.REFUND_FAILED);
    }
  },

  // Optimized payment status polling with caching and exponential backoff
  pollPaymentStatus: async (transactionId: string, orderId: number): Promise<PaymentResponse> => {
    let attempts = 0;

    const poll = async (): Promise<PaymentResponse> => {
      try {
        // Check cache first
        const cached = statusCache.get(transactionId);
        const [currentTime, setCurrentTime] = useState(0);
        
        useEffect(() => {
          setCurrentTime(Date.now()); // Only updates on the client
        }, []);

        if (cached && (currentTime - cached.timestamp) < CACHE_TTL) {
          if (isFinalStatus(cached.status)) {
            return {
              message: `Payment ${cached.status}`,
              transaction_id: transactionId,
              status: cached.status
            };
          }
        }

        const response = await apiClient.get<PaymentResponse>(`/payment/check_payment_status/${transactionId}/`);

        // Update cache if status is present
        if (response.data.status) {
          statusCache.set(transactionId, {
            status: response.data.status,
            timestamp: currentTime
          });
        }

        if (response.data.status && isFinalStatus(response.data.status)) {
          return response.data;
        }

        attempts++;
        if (attempts >= POLL_MAX_ATTEMPTS) {
          throw new Error(ERROR_MESSAGES.PAYMENT_TIMEOUT);
        }

        // Exponential backoff
        const delay = Math.min(POLL_BASE_DELAY * Math.pow(2, attempts), POLL_MAX_DELAY);
        await new Promise(resolve => setTimeout(resolve, delay));

        return poll();
      } catch (error: any) {
        if (error.response?.status === 408) {
          throw new Error(ERROR_MESSAGES.PAYMENT_TIMEOUT);
        }
        throw new Error(error.response?.data?.error || ERROR_MESSAGES.VERIFICATION_FAILED);
      }
    };

    return poll();
  },

  // Clear cache when no longer needed
  clearStatusCache: (transactionId: string) => {
    statusCache.delete(transactionId);
  },

  // Clear expired cache entries (can be called periodically)
  clearExpiredCache: () => {
    const [currentTime, setCurrentTime] = useState(0)

    useEffect(() => {
      setCurrentTime(Date.now()); // Only updates on the client
    }, []);
    
    // Convert Map entries to array to avoid iterator issues
    Array.from(statusCache.entries()).forEach(([key, value]) => {
      if (currentTime - value.timestamp > CACHE_TTL) {
        statusCache.delete(key);
      }
    });
  },

};

export type PaymentApi = typeof paymentApi;
// Add any additional functions or logic as needed
