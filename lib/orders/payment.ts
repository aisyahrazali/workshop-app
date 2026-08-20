import type { PaymentMethod } from "@/lib/menu/types";

/** Payment options shown at checkout. This is a demo checkout —
 *  nothing is charged; the choice is stored on the order. */
export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  emoji: string;
  hint: string;
}[] = [
  { id: "counter", label: "Pay at counter", emoji: "💵", hint: "Pay when you collect" },
  { id: "card", label: "Card", emoji: "💳", hint: "Credit or debit" },
  { id: "ewallet", label: "E-wallet", emoji: "📱", hint: "TNG / GrabPay" },
];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  counter: "Pay at counter",
  card: "Card",
  ewallet: "E-wallet",
};
