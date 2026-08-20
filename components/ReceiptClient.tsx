"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/config/brand";
import { formatMYR } from "@/lib/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/menu/types";
import { STATUS_LABELS } from "@/lib/orders/status";
import { PAYMENT_LABELS } from "@/lib/orders/payment";

export default function ReceiptClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle()
      .then(({ data }) => {
        setOrder((data as Order | null) ?? null);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-sm px-4 py-10">
        <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-sm px-4 py-10 text-center">
        <h1 className="text-2xl font-bold">Receipt not found</h1>
        <p className="mt-2 text-gray-600">
          This order doesn&apos;t exist, or it belongs to another account.
        </p>
        <Link
          href="/orders"
          className="mt-6 inline-block rounded-md px-5 py-2.5 font-medium text-white"
          style={{ backgroundColor: brand.primaryColor }}
        >
          Back to my orders
        </Link>
      </main>
    );
  }

  const placed = new Date(order.created_at).toLocaleString("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const payment = PAYMENT_LABELS[order.payment_method ?? "counter"];

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      {/* The receipt itself — the only thing that prints */}
      <div className="receipt-print rounded-2xl border border-gray-200 bg-white p-6 font-mono text-sm shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Image src={brand.logo} alt={`${brand.name} logo`} width={40} height={40} />
          <p className="mt-2 text-base font-bold tracking-wide">{brand.name}</p>
          <p className="mt-0.5 text-xs text-gray-500">{brand.tagline}</p>
        </div>

        <div className="my-4 border-t border-dashed border-gray-300" />

        <dl className="space-y-1 text-gray-700">
          <div className="flex justify-between">
            <dt className="text-gray-500">Order</dt>
            <dd className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Placed</dt>
            <dd>{placed}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Payment</dt>
            <dd>{payment}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Status</dt>
            <dd>{STATUS_LABELS[order.status]}</dd>
          </div>
        </dl>

        <div className="my-4 border-t border-dashed border-gray-300" />

        <ul className="space-y-1.5 tabular-nums">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="min-w-0 flex-1">
                {item.quantity} × {item.item_name}
              </span>
              <span>{formatMYR(item.price_cents * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-dashed border-gray-300" />

        <p className="flex justify-between text-base font-bold tabular-nums">
          <span>TOTAL</span>
          <span>{formatMYR(order.total_cents)}</span>
        </p>
        {order.payment_method === "counter" && (
          <p className="mt-1 text-right text-xs text-gray-500">Pay at the counter on collection</p>
        )}

        <div className="my-4 border-t border-dashed border-gray-300" />

        <p className="text-center text-xs text-gray-500">
          Terima kasih! 🙏
          <br />
          Show this receipt when you collect your order.
        </p>
      </div>

      <div className="no-print mt-6 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => window.print()}
          className="rounded-md px-5 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: brand.primaryColor }}
        >
          Print receipt
        </button>
        <Link
          href="/orders"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Track this order
        </Link>
        <Link href="/menu" className="text-sm text-gray-600 underline hover:text-gray-900">
          Order more
        </Link>
      </div>
    </main>
  );
}
