"use client";

import { useEffect, useState } from "react";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { MenuCategory, MenuItem } from "@/lib/menu/types";
import BackendNotConnected from "./BackendNotConnected";
import MenuItemCard from "./MenuItemCard";

const CATEGORY_TABS: { id: MenuCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "food", label: "Food" },
  { id: "drinks", label: "Drinks" },
  { id: "desserts", label: "Desserts" },
];

export default function MenuClient() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [category, setCategory] = useState<MenuCategory | "all">("all");
  // When Supabase isn't configured we render BackendNotConnected instead,
  // so "loading" only matters on the configured path.
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("menu_items")
      .select("*")
      .order("category")
      .order("sort_order")
      .then(({ data, error }) => {
        if (error) setError("Couldn't load the menu. Please refresh to try again.");
        else setItems((data ?? []) as MenuItem[]);
        setLoading(false);
      });
  }, []);

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto mt-12 max-w-4xl px-4">
        <BackendNotConnected />
      </div>
    );
  }

  const visible = category === "all" ? items : items.filter((i) => i.category === category);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Menu</h1>
      <p className="mt-1 text-gray-600">Kopitiam classics, made fresh when you order.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === tab.id
                ? "border-transparent text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            style={category === tab.id ? { backgroundColor: brand.primaryColor } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-gray-500">Loading the menu…</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="mt-6 text-gray-500">
          No items here yet — run <code>supabase/kopitiam-schema.sql</code> in your Supabase SQL
          editor to seed the menu.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, i) => (
          <div
            key={item.id}
            className="animate-fade-up h-full"
            style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}
          >
            <MenuItemCard item={item} />
          </div>
        ))}
      </div>
    </main>
  );
}
