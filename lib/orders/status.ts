import type { OrderStatus } from "@/lib/menu/types";

/** The happy-path progression shown in the customer timeline. */
export const ORDER_PROGRESSION = [
  "pending",
  "preparing",
  "ready",
  "completed",
] as const;

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Tailwind classes for the status badge pill. */
export const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
};

/** What the staff "Advance" button moves an order to. */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
};
