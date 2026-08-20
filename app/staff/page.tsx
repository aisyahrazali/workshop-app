import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import BackendNotConnected from "@/components/BackendNotConnected";
import StaffOrdersClient from "@/components/StaffOrdersClient";

export const metadata = { title: "Staff — orders" };

export default async function StaffPage() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="flex-1 bg-white">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-2xl font-bold">Staff</h1>
          <div className="mt-4">
            <BackendNotConnected />
          </div>
        </main>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/staff");

  // Second gate: only accounts flagged in public.profiles get through.
  // (The database enforces this too — RLS hides other users' orders —
  // this check just gives non-staff a clear message instead of an empty page.)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_staff")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_staff) {
    return (
      <div className="flex-1 bg-white">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-2xl font-bold">Staff access only</h1>
          <p className="mt-3 text-gray-600">
            This page is for kitchen staff. If you should have access, ask an admin to run the
            staff bootstrap snippet in <code>supabase/kopitiam-schema.sql</code> for your account.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      <StaffOrdersClient />
    </div>
  );
}
