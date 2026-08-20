"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { menuImage } from "@/lib/menu/images";
import { formatMYR } from "@/lib/format";
import { useCart } from "@/lib/cart/CartContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { PAYMENT_METHODS } from "@/lib/orders/payment";
import type { PaymentMethod } from "@/lib/menu/types";

export default function CheckoutClient() {
  const router = useRouter();
  const { lines, hydrated, totalCents, clear } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("counter");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validatePayment(): string | null {
    if (method !== "card") return null;
    if (!/^\d{16}$/.test(card.number.replace(/\s/g, ""))) {
      return "Enter the 16-digit card number.";
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
      return "Expiry must look like MM/YY.";
    }
    if (!/^\d{3}$/.test(card.cvc)) {
      return "CVC is the 3 digits on the back of the card.";
    }
    return null;
  }

  async function handlePlaceOrder() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || lines.length === 0) return;

    const paymentError = validatePayment();
    if (paymentError) {
      setError(paymentError);
      return;
    }

    setBusy(true);
    setError(null);

    // Demo checkout: card and e-wallet payments are simulated, nothing is
    // charged. A short pause makes the flow feel real.
    if (method !== "counter") {
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    // place_order runs as ONE transaction in Postgres and re-checks
    // availability + prices server-side, so the total can't be tampered with.
    const { data: orderId, error } = await supabase.rpc("place_order", {
      items: lines.map((l) => ({ menu_item_id: l.menuItemId, quantity: l.quantity })),
      payment_method: method,
    });

    if (error || !orderId) {
      setBusy(false);
      setError(error?.message || "Something went wrong placing your order. Please try again.");
      return;
    }

    clear();
    router.push(`/orders/${orderId}/receipt`);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>

      {!hydrated ? (
        <p className="mt-6 text-gray-500">Loading your order…</p>
      ) : lines.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-600">Your cart is empty — nothing to check out.</p>
          <Link
            href="/menu"
            className="mt-4 inline-block rounded-md px-5 py-2.5 font-medium text-white"
            style={{ backgroundColor: brand.primaryColor }}
          >
            Browse the menu
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-gray-200 rounded-xl border border-gray-200">
            {lines.map((line) => (
              <li key={line.menuItemId} className="flex items-center gap-3 p-4">
                {menuImage(line.name) ? (
                  <Image
                    src={menuImage(line.name)!}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-2xl" aria-hidden>
                    {line.emoji}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{line.name}</p>
                  <p className="text-sm text-gray-500">
                    {line.quantity} × {formatMYR(line.priceCents)}
                  </p>
                </div>
                <span className="font-medium">{formatMYR(line.priceCents * line.quantity)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between p-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">{formatMYR(totalCents)}</span>
            </li>
          </ul>

          <h2 className="mt-8 text-lg font-semibold">Payment</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {PAYMENT_METHODS.map((pm) => {
              const selected = method === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => {
                    setMethod(pm.id);
                    setError(null);
                  }}
                  aria-pressed={selected}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    selected
                      ? "border-amber-400 bg-amber-50/60"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {pm.emoji}
                  </span>
                  <span className="mt-1 block font-medium">{pm.label}</span>
                  <span className="text-sm text-gray-500">{pm.hint}</span>
                </button>
              );
            })}
          </div>

          {method === "card" && (
            <div className="mt-4 space-y-3 rounded-xl border border-gray-200 p-4">
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium">
                  Card number
                </label>
                <input
                  id="card-number"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="card-expiry" className="block text-sm font-medium">
                    Expiry
                  </label>
                  <input
                    id="card-expiry"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
                  />
                </div>
                <div>
                  <label htmlFor="card-cvc" className="block text-sm font-medium">
                    CVC
                  </label>
                  <input
                    id="card-cvc"
                    inputMode="numeric"
                    placeholder="123"
                    maxLength={3}
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
                  />
                </div>
              </div>
            </div>
          )}

          {method === "ewallet" && (
            <p className="mt-4 rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
              You&apos;d normally get a payment prompt in your e-wallet app here.
            </p>
          )}

          <p className="mt-3 text-xs text-gray-500">
            Demo checkout — no real payment is taken.
          </p>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handlePlaceOrder}
              disabled={busy}
              className="rounded-md px-5 py-2.5 font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: brand.primaryColor }}
            >
              {busy
                ? "Processing…"
                : method === "counter"
                  ? "Place order — pay at counter"
                  : `Pay ${formatMYR(totalCents)}`}
            </button>
            <Link href="/cart" className="text-sm text-gray-600 underline hover:text-gray-900">
              Back to cart
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
