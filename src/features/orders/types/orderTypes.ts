// Order Status Types
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// Shipping Method Types
export type ShippingMethod = 'standard' | 'express' | 'overnight';

// Order Item Interface
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  products: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    discount: number | null;
    price: number;
  } | null;
  created_at?: string;
}

// User Info Interface
export interface OrderUserInfo {
  id: string;
  email: string;
  full_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  shipping_cost: number;
}

// Order Interface
export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  tracking_code?: string | null;
  created_at: string;
  updated_at?: string;
  shipping_method: ShippingMethod;
}

// Order with Relations
export interface OrderWithDetails extends Order {
  users: OrderUserInfo;
  items: OrderItem[];
}

// Create Order Payload
export interface CreateOrderPayload {
  shipping_method?: ShippingMethod;
}

// Create Order Response
export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  total: number;
  status: OrderStatus;
  message?: string;
}

// Update Order Status Payload
export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  tracking_code?: string;
}

// Payment Session
export interface PaymentSession {
  success: boolean;
  session_id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_url: string;
  expires_at: string;
}

// Payment Verification Payload
export interface PaymentVerificationPayload {
  order_id: string;
  success: boolean;
  session_id?: string;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Orders List Response
export interface OrdersListResponse {
  success: boolean;
  orders: OrderWithDetails[];
  pagination: Pagination;
}

// Single Order Response
export interface OrderResponse {
  success: boolean;
  order: OrderWithDetails;
  message?: string;
}

// API Error Response
export interface ApiError {
  response?: {
    data?: {
      message?: string;
      success?: boolean;
    };
  };
  message?: string;
}