export interface PaymentMethod {
  id: number;
  type: "mpesa" | "card" | "bank";
  is_default: boolean;
  details: {
    last4?: string;
    brand?: string;
    phone_number?: string;
    bank_name?: string;
  };
}


export interface MpesaPaymentRequest {
  phone_number: string;
  order_id: number;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Transaction {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  status: PaymentStatus;
  created_at: string;
  checkout_request_id?: string;
  payment_details?: Record<string, unknown>;
}

export interface PaymentVerification {
  transaction_id: string;
  order_id: number;
}

export interface PaymentResponse {
  message: string;
  transaction_id: string;
  checkout_request_id?: string;
  status: PaymentStatus;
  redirect_url?: string;
}

export interface RefundRequest {
  amount?: number;
  reason: string;
}

export interface PaymentReceipt {
  transaction_id: string;
  order_id: number;
  amount: number;
  payment_method: string;
  status: PaymentStatus;
  date: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
}

// Cache types
export interface StatusCacheEntry {
  status: PaymentStatus;
  timestamp: number;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}


export interface Transaction {
  id: number;
  order_id: number;
  amount: number;
  currency: string;
  status: PaymentStatus,
  payment_method: string;
  transaction_id: string;
  created_at: string;
  updated_at: string;
}

export interface InitiatePaymentInput {
  order_id: number;
  payment_method: "mpesa" | "card" | "bank";
  payment_details: {
    phone_number?: string;
    card_token?: string;
    bank_account?: string;
  };
}

export interface MpesaPaymentRequest {
  phone_number: string;
  order_id: number;
  amount: number;
}

export interface PaymentVerification {
  transaction_id: string;
}

export interface PaymentResponse {
  message: string;
  transaction_id: string;
  status: PaymentStatus;
}

export interface RefundRequest {
  reason: string;
  amount?: number;
}

export interface PaymentReceipt {
  receipt_url: string;
}


export interface StatusCacheEntry {
    status: PaymentStatus;
    timestamp: number;
}

export interface Payment {
    id: number;
    orderId: number;
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentDate: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    clientSecret: string;
}