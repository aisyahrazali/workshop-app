import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import BackendNotConnected from "@/components/BackendNotConnected";
import ReceiptClient from "@/components/ReceiptClient";

export const metadata = { title: "Receipt" };

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="flex-1 bg-white">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-2xl font-bold">Receipt</h1>
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
  if (!user) redirect(`/login?next=/orders/${id}/receipt`);

  return (
    <div className="flex-1 bg-gray-50">
      <ReceiptClient orderId={id} />
    </div>
  );
}
