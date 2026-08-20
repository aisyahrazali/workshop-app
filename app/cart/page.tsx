import CartClient from "@/components/CartClient";

export const metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="flex-1 bg-white">
      <CartClient />
    </div>
  );
}
