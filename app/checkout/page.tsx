import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import BackendNotConnected from "@/components/BackendNotConnected";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="flex-1 bg-white">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <div className="mt-4">
            <BackendNotConnected />
          </div>
        </main>
      </div>
    );
  }

  // Identity is verified ON THE SERVER — signed-out visitors go to login
  // and come straight back here afterwards.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  return (
    <div className="flex-1 bg-white">
      <CheckoutClient />
    </div>
  );
}
