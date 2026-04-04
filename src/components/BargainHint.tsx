import { Info } from "lucide-react";

interface Props {
  bargainPercentage: number;
}

export function BargainHint({ bargainPercentage }: Props) {
  const text =
    bargainPercentage >= 30
      ? `У цій категорії ${bargainPercentage}% покупців торгуються. Рекомендуємо встановити ціну трохи вище — з розрахунком на знижку.`
      : "У цій категорії покупці рідко торгуються. Встановлена ціна скоріш за все буде фінальною.";

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100">
      <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
      <p className="text-sm text-blue-800 font-medium leading-snug">{text}</p>
    </div>
  );
}
