import Link from "next/link";
import { brand } from "@/lib/config/brand";
import TodaysPick from "@/components/TodaysPick";

// ─────────────────────────────────────────────────────────────
// HOMEPAGE CONTENT — safe to customize in Module 4.
// Edit the words below, or reorder the sections in SECTION_ORDER.
// ─────────────────────────────────────────────────────────────

const subcopy =
  "Kopitiam classics, ordered from your phone and tracked from the kitchen to your table. No queue, no shouting over the counter.";

const howItWorks = [
  {
    title: "Browse the menu",
    text: "Nasi lemak, kaya toast, teh tarik — food, drinks and desserts, priced honestly.",
  },
  {
    title: "Build your cart",
    text: "Set quantities and watch the total. No account needed until you order.",
  },
  {
    title: "Track your order",
    text: "Sign in to place it, then follow it live: pending → preparing → ready.",
  },
];

// Reorder these to change the page layout (Module 4 layout edit).
const SECTION_ORDER = ["hero", "todays-pick", "how-it-works", "cta"] as const;

// ─────────────────────────────────────────────────────────────

type SectionId = (typeof SECTION_ORDER)[number];

const sections: Record<SectionId, React.ReactNode> = {
  hero: (
    <section key="hero" className="relative overflow-hidden px-4 pb-12 pt-20 text-center">
      {/* soft amber glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full opacity-[0.08] blur-3xl"
        style={{ backgroundColor: brand.primaryColor }}
      />
      {brand.showWorkshopBadge && (
        <span className="mb-6 inline-block rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600">
          Built at the TimeTec AI Workshop
        </span>
      )}
      <h1 className="animate-fade-up mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
        Good kopi. Real food.{" "}
        <span style={{ color: brand.primaryColor }}>Zero queue.</span>
      </h1>
      <p
        className="animate-fade-up mx-auto mt-5 max-w-xl text-lg text-gray-600"
        style={{ animationDelay: "90ms" }}
      >
        {subcopy}
      </p>
      <div
        className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-4"
        style={{ animationDelay: "180ms" }}
      >
        <Link
          href="/menu"
          className="rounded-md px-6 py-3 font-medium text-white"
          style={{ backgroundColor: brand.primaryColor }}
        >
          Browse the menu
        </Link>
        <a
          href="#how-it-works"
          className="rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          How it works
        </a>
      </div>
      <p className="animate-fade-up mt-6 text-xs text-gray-500" style={{ animationDelay: "260ms" }}>
        Order in under a minute · Pay at the counter · Live order tracking
      </p>
      <div
        className="animate-fade-up mt-10 flex justify-center gap-8 text-4xl"
        style={{ animationDelay: "340ms" }}
        aria-hidden
      >
        <span className="-rotate-6 inline-block transition-transform duration-300 hover:scale-125">🍛</span>
        <span className="rotate-3 inline-block transition-transform duration-300 hover:scale-125">☕</span>
        <span className="-rotate-3 inline-block transition-transform duration-300 hover:scale-125">🍞</span>
        <span className="rotate-6 inline-block transition-transform duration-300 hover:scale-125">🍧</span>
      </div>
    </section>
  ),
  "todays-pick": <TodaysPick key="todays-pick" />,
  "how-it-works": (
    <section key="how-it-works" id="how-it-works" className="scroll-mt-16 px-4 py-14">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-semibold">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {howItWorks.map((step, i) => (
            <div key={step.title} className="rounded-2xl bg-gray-50 p-6">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: brand.primaryColor }}
              >
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
  cta: (
    <section key="cta" className="px-4 py-16">
      <div
        className="mx-auto max-w-4xl rounded-3xl px-6 py-14 text-center text-white"
        style={{ backgroundColor: brand.primaryColor }}
      >
        <h2 className="text-3xl font-bold">Hungry already?</h2>
        <p className="mx-auto mt-3 max-w-md text-amber-100">
          The kitchen&apos;s on. Start an order now, or make an account so your next one is even
          faster.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/menu"
            className="rounded-md bg-white px-6 py-3 font-medium"
            style={{ color: brand.primaryColor }}
          >
            Start an order
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-white/60 px-6 py-3 font-medium text-white hover:bg-white/10"
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  ),
};

export default function HomePage() {
  return (
    <div className="flex-1 bg-white">
      <main>{SECTION_ORDER.map((id) => sections[id])}</main>
      <footer className="border-t border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
        {brand.name} — {brand.tagline}
      </footer>
    </div>
  );
}
