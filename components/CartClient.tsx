"use client";

import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/config/brand";
import { formatMYR } from "@/lib/format";
import { useCart, MAX_QUANTITY } from "@/lib/cart/CartContext";
import { menuImage } from "@/lib/menu/images";

export default function CartClient() {
  const { lines, hydrated, setQuantity, removeItem, totalCents } = useCart();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">Your cart</h1>

      {!hydrated ? (
        <p className="mt-6 text-gray-500">Loading your cart…</p>
      ) : lines.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-600">Your cart is empty.</p>
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
              <li key={line.menuItemId} className="animate-fade-up flex items-center gap-3 p-4">
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
                  <p className="text-sm text-gray-500">{formatMYR(line.priceCents)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}
                    aria-label={`Remove one ${line.name}`}
                    className="h-8 w-8 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                  <button
                    onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                    disabled={line.quantity >= MAX_QUANTITY}
                    aria-label={`Add one ${line.name}`}
                    className="h-8 w-8 rounded-md text-white disabled:opacity-50"
                    style={{ backgroundColor: brand.primaryColor }}
                  >
                    +
                  </button>
                </div>
                <span className="w-20 text-right font-medium">
                  {formatMYR(line.priceCents * line.quantity)}
                </span>
                <button
                  onClick={() => removeItem(line.menuItemId)}
                  aria-label={`Remove ${line.name} from cart`}
                  className="text-sm text-gray-400 hover:text-red-600"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-lg font-semibold">Total: {formatMYR(totalCents)}</p>
            <Link
              href="/checkout"
              className="rounded-md px-5 py-2.5 font-medium text-white"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Checkout
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            You&apos;ll be asked to sign in before the order is placed.
          </p>
        </>
      )}
    </main>
  );
}
