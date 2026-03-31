import { Zap, Scale, TrendingUp } from "lucide-react";
import type { Strategy } from "../types";
import { formatPrice } from "../helpers";

const ICONS = {
  emerald: Zap,
  violet: Scale,
  amber: TrendingUp,
};

export function StrategyCard({
  strategy,
  featured,
  color,
}: {
  strategy: Strategy;
  featured?: boolean;
  color: "emerald" | "violet" | "amber";
}) {
  const Icon = ICONS[color];
  
  const styles: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    violet: featured
      ? "bg-violet-600 text-white shadow-xl shadow-violet-200 scale-105 ring-1 ring-violet-500"
      : "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 text-center flex flex-col justify-between transition-all hover:translate-y-[-2px] ${styles[color]}`}>
      <div className="flex justify-center mb-2">
        <div className={`p-2 rounded-xl ${featured ? "bg-white/20" : "bg-white/50"}`}>
          <Icon size={18} />
        </div>
      </div>
      
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">
          {strategy.name}
        </div>
        <div className="text-lg font-black leading-none">
          {formatPrice(strategy.recommended_listing_price)}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-medium opacity-60">
          ~{strategy.estimated_days}
        </div>
        {strategy.badge && (
          <div className={`mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${
            featured ? "bg-white text-violet-600" : "bg-white/80"
          }`}>
            {strategy.badge}
          </div>
        )}
      </div>
    </div>
  );
}
