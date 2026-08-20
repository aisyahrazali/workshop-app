import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  // Only allow same-site paths as a post-login destination.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  return (
    <div className="flex-1 bg-white">
      <LoginForm confirmError={error === "confirm"} next={safeNext} />
    </div>
  );
}
