import { 
  Lightbulb, 
  Info, 
  TrendingUp, 
  Clock, 
  Handshake, 
  ShieldCheck, 
  BarChart3 
} from "lucide-react";
import type { MarketTemplate } from "../types";

const ICON_MAP: Record<string, React.ReactNode> = {
  "trend-up": <TrendingUp size={14} className="text-emerald-500" />,
  "clock": <Clock size={14} className="text-amber-500" />,
  "handshake": <Handshake size={14} className="text-violet-500" />,
  "shield": <ShieldCheck size={14} className="text-blue-500" />,
  "chart-bar": <BarChart3 size={14} className="text-rose-500" />,
};

export function MarketInsights({
  confidence,
  label,
  templates,
}: {
  confidence: number;
  label: string;
  templates: MarketTemplate[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
            <Lightbulb size={16} />
          </div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
            Аналіз ринку
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
          <Info size={12} />
          {label} ({confidence}%)
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {templates.map((t, i) => (
          <div key={i} className="flex gap-3 items-start p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-violet-100">
            <div className="min-w-[32px] h-8 flex items-center justify-center rounded-xl bg-gray-50 text-base leading-none">
              {ICON_MAP[t.icon] || t.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-900 leading-tight">
                {t.title}
              </div>
              <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                {t.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
