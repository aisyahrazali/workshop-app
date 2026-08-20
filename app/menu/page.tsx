import MenuClient from "@/components/MenuClient";

export const metadata = { title: "Menu" };

export default function MenuPage() {
  return (
    <div className="flex-1 bg-white">
      <MenuClient />
    </div>
  );
}
