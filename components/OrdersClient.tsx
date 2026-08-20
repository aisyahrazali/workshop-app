"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/menu/types";
import OrderCard from "./OrderCard";

const POLL_MS = 10_000;

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError("Couldn't load your orders. Please try refreshing.");
        } else {
          setError(null);
          setOrders((data ?? []) as Order[]);
        }
        setLoading(false);
      });
  }, []);

  // Load now, then poll so status changes from the kitchen show up on their own.
  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, POLL_MS);
    return () => clearInterval(timer);
  }, [loadOrders]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My orders</h1>
        <button
          onClick={loadOrders}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Status updates automatically every few seconds.
      </p>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-gray-500">Loading your orders…</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-6">
          <p className="text-gray-600">You haven&apos;t ordered anything yet.</p>
          <Link
            href="/menu"
            className="mt-4 inline-block rounded-md px-5 py-2.5 font-medium text-white"
            style={{ backgroundColor: brand.primaryColor }}
          >
            Browse the menu
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </main>
  );
}
