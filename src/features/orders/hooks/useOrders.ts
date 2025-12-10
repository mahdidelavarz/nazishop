"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  fetchOrders,
  fetchOrder,
  createOrder,
  updateOrderStatus,
  createPaymentSession,
  verifyPayment,
} from "../services/orderService";
import {
  OrderWithDetails,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  PaymentVerificationPayload,
  ApiError,
} from "../types/orderTypes";

// ------------------------
// Fetch orders list
// ------------------------
export const useOrdersQuery = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const { isAuthenticated, user } = useAuthStore();

  return useQuery({
    queryKey: ["orders", user?.id, params],
    enabled: isAuthenticated && !!user?.id,
    queryFn: async () => {
      const response = await fetchOrders(params);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// ------------------------
// Fetch single order
// ------------------------
export const useOrderQuery = (orderId: string) => {
  const { isAuthenticated, user } = useAuthStore();

  return useQuery({
    queryKey: ["order", orderId, user?.id],
    enabled: isAuthenticated && !!user?.id && !!orderId,
    queryFn: async () => {
      const response = await fetchOrder(orderId);
      return response.order;
    },
    staleTime: 30 * 1000,
  });
};

// ------------------------
// Create order
// ------------------------
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const response = await createOrder(payload);
      return response;
    },
    onSuccess: (data) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("سفارش با موفقیت ثبت شد");
      }
      
      // Invalidate orders and cart
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? ((error as ApiError).response?.data?.message ??
            (error as ApiError).message ??
            "خطا در ثبت سفارش")
          : "خطا در ثبت سفارش";
      toast.error(message);
    },
  });
};

// ------------------------
// Update order status (admin)
// ------------------------
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: UpdateOrderStatusPayload;
    }) => {
      const response = await updateOrderStatus(orderId, payload);
      return response;
    },
    onSuccess: (data, variables) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("وضعیت سفارش با موفقیت به‌روزرسانی شد");
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? ((error as ApiError).response?.data?.message ??
            (error as ApiError).message ??
            "خطا در به‌روزرسانی وضعیت سفارش")
          : "خطا در به‌روزرسانی وضعیت سفارش";
      toast.error(message);
    },
  });
};

// ------------------------
// Create payment session
// ------------------------
export const useCreatePaymentSession = () => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await createPaymentSession(orderId);
      return response;
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? ((error as ApiError).response?.data?.message ??
            (error as ApiError).message ??
            "خطا در ایجاد جلسه پرداخت")
          : "خطا در ایجاد جلسه پرداخت";
      toast.error(message);
    },
  });
};

// ------------------------
// Verify payment
// ------------------------
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PaymentVerificationPayload) => {
      const response = await verifyPayment(payload);
      return response;
    },
    onSuccess: (data, variables) => {
      if (variables.success) {
        toast.success("پرداخت با موفقیت انجام شد");
      } else {
        toast.error("پرداخت ناموفق بود");
      }

      // Invalidate orders
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.order_id] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? ((error as ApiError).response?.data?.message ??
            (error as ApiError).message ??
            "خطا در تأیید پرداخت")
          : "خطا در تأیید پرداخت";
      toast.error(message);
    },
  });
};