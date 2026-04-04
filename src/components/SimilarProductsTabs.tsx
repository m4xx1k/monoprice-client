import type { SoldProduct, ActiveProduct } from "../types";
import { SoldProductCard, ActiveProductCard } from "./SimilarProductCard";

interface Props {
  sold: SoldProduct[];
  active: ActiveProduct[];
  activeTab: "sold" | "active";
  onTabChange: (tab: "sold" | "active") => void;
}

export function SimilarProductsTabs({ sold, active, activeTab, onTabChange }: Props) {
  const hasSold = sold.length > 0;
  const hasActive = active.length > 0;

  if (!hasSold && !hasActive) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Segmented control */}
      <div className="flex bg-gray-200 rounded-full p-1">
        <button
          type="button"
          onClick={() => onTabChange("sold")}
          className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
            activeTab === "sold" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Продані
        </button>
        <button
          type="button"
          onClick={() => onTabChange("active")}
          className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
            activeTab === "active" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          У продажу
        </button>
      </div>

      {/* Card list — key forces remount/scroll reset on tab change */}
      <div
        key={activeTab}
        className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5"
        style={{ scrollbarWidth: "none" }}
      >
        {activeTab === "sold" &&
          (hasSold ? (
            sold.map((product, i) => <SoldProductCard key={i} product={product} />)
          ) : (
            <p className="text-sm text-gray-400 py-4">Немає даних</p>
          ))}
        {activeTab === "active" &&
          (hasActive ? (
            active.map((product, i) => <ActiveProductCard key={i} product={product} />)
          ) : (
            <p className="text-sm text-gray-400 py-4">Немає даних</p>
          ))}
      </div>
    </div>
  );
}
