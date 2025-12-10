import { apiClient } from "@/shared/lib/api-client";
import {
  CreateOrderPayload,
  CreateOrderResponse,
  OrdersListResponse,
  OrderResponse,
  UpdateOrderStatusPayload,
  PaymentSession,
  PaymentVerificationPayload,
} from "../types/orderTypes";

// Fetch user's orders
export const fetchOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<OrdersListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);

  const url = `/orders${queryParams.toString() ? `?${queryParams}` : ""}`;
  const response = await apiClient.get<OrdersListResponse>(url);
  return response.data;
};

// Fetch single order
export const fetchOrder = async (orderId: string): Promise<OrderResponse> => {
  const response = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
  return response.data;
};

// Create new order
export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  const response = await apiClient.post<CreateOrderResponse>("/orders", payload);
  return response.data;
};

// Update order status (admin only)
export const updateOrderStatus = async (
  orderId: string,
  payload: UpdateOrderStatusPayload
): Promise<OrderResponse> => {
  const response = await apiClient.patch<OrderResponse>(
    `/orders/${orderId}/status`,
    payload
  );
  return response.data;
};

// Create payment session
export const createPaymentSession = async (
  orderId: string
): Promise<PaymentSession> => {
  const response = await apiClient.post<PaymentSession>(
    "/payments/create-session",
    { order_id: orderId }
  );
  return response.data;
};

// Verify payment
export const verifyPayment = async (
  payload: PaymentVerificationPayload
): Promise<OrderResponse> => {
  const response = await apiClient.post<OrderResponse>(
    "/payments/verify",
    payload
  );
  return response.data;
};