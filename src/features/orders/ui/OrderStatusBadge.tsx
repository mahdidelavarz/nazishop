import { OrderStatus } from "../types/orderTypes";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار",
  paid: "پرداخت شده",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};

interface Props {
  status: OrderStatus;
  className?: string;
}

export default function OrderStatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[status]} ${className}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}