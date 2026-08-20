"use client";

import { useCallback, useEffect, useState } from "react";
import { brand } from "@/lib/config/brand";
import { formatMYR } from "@/lib/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/lib/menu/types";
import { NEXT_STATUS, STATUS_LABELS } from "@/lib/orders/status";
import OrderStatusBadge from "./OrderStatusBadge";

const POLL_MS = 10_000;
const ACTIVE_STATUSES: OrderStatus[] = ["pending", "preparing", "ready"];

export default function StaffOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: true }) // oldest first — kitchen queue order
      .then(({ data, error }) => {
        if (error) {
          setError("Couldn't load orders. Please try refreshing.");
        } else {
          setError(null);
          setOrders((data ?? []) as Order[]);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, POLL_MS);
    return () => clearInterval(timer);
  }, [loadOrders]);

  async function updateStatus(order: Order, status: OrderStatus) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusyId(order.id);
    setError(null);
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (error) {
      setError("Couldn't update the order — only staff accounts can do this.");
    } else {
      loadOrders();
    }
    setBusyId(null);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kitchen queue</h1>
        <button
          onClick={loadOrders}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Active orders, oldest first. The list refreshes every few seconds.
      </p>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-gray-500">Loading orders…</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="mt-6 text-gray-600">No active orders — the kitchen is all caught up. 🎉</p>
      )}

      <div className="mt-6 space-y-4">
        {orders.map((order) => {
          const next = NEXT_STATUS[order.status];
          const busy = busyId === order.id;
          return (
            <div key={order.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleTimeString("en-MY", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {formatMYR(order.total_cents)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                {order.order_items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.item_name}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-3">
                {next && (
                  <button
                    onClick={() => updateStatus(order, next)}
                    disabled={busy}
                    className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    style={{ backgroundColor: brand.primaryColor }}
                  >
                    {busy ? "Updating…" : `Advance to ${STATUS_LABELS[next]}`}
                  </button>
                )}
                <button
                  onClick={() => updateStatus(order, "cancelled")}
                  disabled={busy}
                  className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
