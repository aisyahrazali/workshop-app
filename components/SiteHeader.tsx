"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart/CartContext";

/** Top navigation shown on every page: menu, cart (with count) and auth links. */
export default function SiteHeader() {
  const router = useRouter();
  const { count, hydrated } = useCart();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
          style={{ color: brand.primaryColor }}
        >
          <Image src={brand.logo} alt={`${brand.name} logo`} width={28} height={28} />
          {brand.name}
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-3">
          <Link href="/menu" className="rounded-md px-2 py-1.5 text-gray-600 hover:text-gray-900 sm:px-3">
            Menu
          </Link>
          <Link
            href="/cart"
            className="relative rounded-md px-2 py-1.5 text-gray-600 hover:text-gray-900 sm:px-3"
          >
            Cart
            {hydrated && count > 0 && (
              <span
                key={count} // re-mounts on change so the pop animation replays
                className="animate-pop ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: brand.primaryColor }}
              >
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link
                href="/orders"
                className="rounded-md px-2 py-1.5 text-gray-600 hover:text-gray-900 sm:px-3"
              >
                My orders
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-2 py-1.5 text-gray-600 hover:text-gray-900 sm:px-3"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md px-3 py-1.5 font-medium text-white"
                style={{ backgroundColor: brand.primaryColor }}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
