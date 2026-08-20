import type { OrderStatus } from "@/lib/menu/types";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/lib/orders/status";

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
