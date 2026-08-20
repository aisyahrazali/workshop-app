import Link from "next/link";
import { formatMYR } from "@/lib/format";
import type { Order } from "@/lib/menu/types";
import { PAYMENT_LABELS } from "@/lib/orders/payment";
import OrderStatusBadge from "./OrderStatusBadge";
import StatusTimeline from "./StatusTimeline";

export default function OrderCard({ order }: { order: Order }) {
  const placed = new Date(order.created_at).toLocaleString("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
          <p className="text-sm text-gray-500">{placed}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {order.order_items.map((item) => (
          <li key={item.id} className="flex justify-between text-gray-700">
            <span>
              {item.quantity} × {item.item_name}
            </span>
            <span>{formatMYR(item.price_cents * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
        <span className="text-sm text-gray-500">
          {PAYMENT_LABELS[order.payment_method ?? "counter"]}
        </span>
        <span className="font-semibold">Total: {formatMYR(order.total_cents)}</span>
      </div>

      <StatusTimeline status={order.status} />

      <Link
        href={`/orders/${order.id}/receipt`}
        className="mt-3 inline-block text-sm text-gray-600 underline hover:text-gray-900"
      >
        View receipt
      </Link>
    </div>
  );
}
