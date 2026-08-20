"use client";

import Image from "next/image";
import { brand } from "@/lib/config/brand";
import { formatMYR } from "@/lib/format";
import { useCart, MAX_QUANTITY } from "@/lib/cart/CartContext";
import { menuImage } from "@/lib/menu/images";
import type { MenuItem } from "@/lib/menu/types";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { lines, hydrated, addItem, setQuantity } = useCart();
  const line = lines.find((l) => l.menuItemId === item.id);
  const inCart = hydrated && line ? line.quantity : 0;
  const photo = menuImage(item.name);

  const soldOutBadge = !item.is_available && (
    <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-gray-700 shadow-sm">
      Sold out
    </span>
  );

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        item.is_available ? "" : "opacity-60"
      }`}
    >
      {photo ? (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={photo}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {soldOutBadge}
        </div>
      ) : (
        <div className="relative flex h-40 items-center justify-center bg-amber-50/60 text-6xl">
          <span aria-hidden>{item.emoji}</span>
          {soldOutBadge}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold">{item.name}</h3>
        {item.description && <p className="mt-1 text-sm text-gray-600">{item.description}</p>}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-semibold">{formatMYR(item.price_cents)}</span>
          {!item.is_available ? (
            <button
              disabled
              className="cursor-not-allowed rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-400"
            >
              Unavailable
            </button>
          ) : inCart === 0 ? (
            <button
              onClick={() => addItem(item)}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-transform active:scale-95"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Add to cart
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(item.id, inCart - 1)}
                aria-label={`Remove one ${item.name}`}
                className="h-8 w-8 rounded-md border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium">{inCart}</span>
              <button
                onClick={() => addItem(item)}
                disabled={inCart >= MAX_QUANTITY}
                aria-label={`Add one ${item.name}`}
                className="h-8 w-8 rounded-md text-white transition-transform active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: brand.primaryColor }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
