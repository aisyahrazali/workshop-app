import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Handles the link from Supabase confirmation emails.
 *  With email confirmation OFF (the workshop default) this is rarely hit,
 *  but it must exist so the ON case also works. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await getSupabaseServerClient();
  if (!supabase || !tokenHash || !type) {
    return NextResponse.redirect(`${siteUrl}/login?error=confirm`);
  }

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  return NextResponse.redirect(error ? `${siteUrl}/login?error=confirm` : `${siteUrl}/menu`);
}
