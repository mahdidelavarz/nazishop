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

// User Info Interface (for display purposes)
export interface OrderUserInfo {
  id: string;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
}

// Shipping Address Snapshot (immutable, stored on order)
export interface ShippingAddressSnapshot {
  shipping_full_name: string | null;
  shipping_phone: string | null;
  shipping_address_line: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
}

// Order Interface
export interface Order extends ShippingAddressSnapshot {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  tracking_code?: string | null;
  created_at: string;
  updated_at?: string;
  shipping_method: ShippingMethod;
  shipping_cost: number;
}

// Order with Relations
export interface OrderWithDetails extends Order {
  users: OrderUserInfo;
  items: OrderItem[];
}

// Create Order Payload
export interface CreateOrderPayload {
  address_id: string;
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