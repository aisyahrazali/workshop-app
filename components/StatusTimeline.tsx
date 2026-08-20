import { brand } from "@/lib/config/brand";
import type { OrderStatus } from "@/lib/menu/types";
import { ORDER_PROGRESSION, STATUS_LABELS } from "@/lib/orders/status";

/** Four-step pending → preparing → ready → completed timeline.
 *  A cancelled order shows a single red note instead. */
export default function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="mt-3 text-sm font-medium text-red-700">
        This order was cancelled by the kitchen.
      </p>
    );
  }

  const currentIndex = ORDER_PROGRESSION.indexOf(
    status as (typeof ORDER_PROGRESSION)[number]
  );

  return (
    <ol className="mt-3 flex items-center gap-0">
      {ORDER_PROGRESSION.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={`h-3 w-3 rounded-full ${reached ? "" : "bg-gray-200"}`}
                style={reached ? { backgroundColor: brand.primaryColor } : undefined}
                aria-hidden
              />
              <span
                className={`mt-1 text-[11px] ${
                  i === currentIndex ? "font-semibold text-gray-900" : "text-gray-500"
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {i < ORDER_PROGRESSION.length - 1 && (
              <span
                className={`mx-1 mb-4 h-0.5 flex-1 ${i < currentIndex ? "" : "bg-gray-200"}`}
                style={i < currentIndex ? { backgroundColor: brand.primaryColor } : undefined}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
