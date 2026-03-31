import { Package, FileText, BadgeDollarSign } from "lucide-react";

const STEPS = [
  { label: "Товар", icon: Package },
  { label: "Опис", icon: FileText },
  { label: "Ціна", icon: BadgeDollarSign },
];

export function Progress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {STEPS.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div
            className={`h-1.5 w-full rounded-full transition-all duration-300 ${
              i < step ? "bg-violet-600" : i === step ? "bg-violet-300" : "bg-gray-200"
            }`}
          />
          <div className="flex items-center gap-1">
            <item.icon
              size={12}
              className={`transition-colors ${
                i <= step ? "text-violet-600" : "text-gray-400"
              }`}
            />
            <span
              className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${
                i <= step ? "text-violet-600" : "text-gray-400"
              }`}
            >
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
