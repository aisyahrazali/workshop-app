"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/config/brand";
import { menuImage } from "@/lib/menu/images";
import { formatMYR } from "@/lib/format";
import { useCart } from "@/lib/cart/CartContext";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { MenuItem } from "@/lib/menu/types";

/** Homepage feature: one dish is "today's pick" — the same one for everyone,
 *  rotating daily through the available menu. Renders nothing until the
 *  backend is connected and seeded, so the homepage never breaks. */
export default function TodaysPick() {
  const { lines, hydrated, addItem } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [day, setDay] = useState(0);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("category")
      .order("sort_order")
      .then(({ data, error }) => {
        if (!error) {
          setItems((data ?? []) as MenuItem[]);
          // Days since epoch — same pick for everyone until midnight.
          setDay(Math.floor(Date.now() / 86_400_000));
        }
        setLoading(false);
      });
  }, []);

  if (!isSupabaseConfigured() || (!loading && items.length === 0)) return null;

  if (loading) {
    return (
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="h-44 animate-pulse rounded-3xl bg-gray-100" />
        </div>
      </section>
    );
  }

  // Same pick for everyone all day: rotate through the menu by date.
  const pick = items[day % items.length];
  const inCart = hydrated ? (lines.find((l) => l.menuItemId === pick.id)?.quantity ?? 0) : 0;

  // A taste of the rest of the menu: the top item of each other category.
  const favourites = (["food", "drinks", "desserts"] as const)
    .map((c) => items.find((i) => i.category === c && i.id !== pick.id))
    .filter((i): i is MenuItem => Boolean(i));

  const photo = menuImage(pick.name);

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="animate-fade-up flex flex-col items-center gap-6 rounded-3xl border border-amber-100 bg-amber-50/50 p-8 sm:flex-row sm:gap-8">
          {photo ? (
            <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl shadow-sm sm:h-40 sm:w-40">
              <Image src={photo} alt={pick.name} fill sizes="160px" className="object-cover" />
            </div>
          ) : (
            <span
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white text-6xl shadow-sm"
              aria-hidden
            >
              {pick.emoji}
            </span>
          )}
          <div className="flex-1 text-center sm:text-left">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: brand.primaryColor }}
            >
              Today&apos;s pick
            </p>
            <h2 className="mt-1 text-2xl font-bold">{pick.name}</h2>
            {pick.description && <p className="mt-1 text-gray-600">{pick.description}</p>}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <span className="text-lg font-semibold">{formatMYR(pick.price_cents)}</span>
              <button
                onClick={() => addItem(pick)}
                className="rounded-md px-4 py-2 text-sm font-medium text-white transition-transform active:scale-95"
                style={{ backgroundColor: brand.primaryColor }}
              >
                {inCart > 0 ? `Add another · ${inCart} in cart` : "Add to cart"}
              </button>
              <Link href="/menu" className="text-sm text-gray-600 underline hover:text-gray-900">
                Full menu
              </Link>
            </div>
          </div>
        </div>

        {favourites.length > 0 && (
          <>
            <p className="mt-10 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
              Crowd favourites
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {favourites.map((item, i) => {
                const thumb = menuImage(item.name);
                return (
                  <Link
                    key={item.id}
                    href="/menu"
                    className="animate-fade-up group flex items-center gap-3 rounded-2xl border border-gray-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-md"
                    style={{ animationDelay: `${120 + i * 80}ms` }}
                  >
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-3xl" aria-hidden>
                        {item.emoji}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">{formatMYR(item.price_cents)}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
