export type MenuCategory = "food" | "drinks" | "desserts";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  category: MenuCategory;
  emoji: string;
  is_available: boolean;
  sort_order: number;
  created_at: string;
};

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentMethod = "counter" | "card" | "ewallet";

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  price_cents: number;
  quantity: number;
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_cents: number;
  /** Optional: rows created before the payments update won't have it. */
  payment_method?: PaymentMethod;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
};
