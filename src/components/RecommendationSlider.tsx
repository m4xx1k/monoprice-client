import { useCallback } from "react";

interface PriceRange {
  min: number;
  balanced: number;
  profit: number;
}

interface Props {
  priceRange: PriceRange;
  currentPrice: number;
  onPriceChange: (price: number) => void;
  onEditingChange: (editing: boolean) => void;
}

const SLIDER_MAX = 1000;

/** Map slider position (0..1000) → price */
function sliderToPrice(sliderPos: number, range: PriceRange): number {
  const t = sliderPos / SLIDER_MAX; // 0..1
  let price: number;
  if (t <= 0.5) {
    const t2 = t / 0.5; // 0..1 in first half
    price = range.min + t2 * (range.balanced - range.min);
  } else {
    const t2 = (t - 0.5) / 0.5; // 0..1 in second half
    price = range.balanced + t2 * (range.profit - range.balanced);
  }
  // Snap to nearest 5
  return Math.round(price / 5) * 5;
}

/** Map price → slider position (0..1000) */
function priceToSlider(price: number, range: PriceRange): number {
  if (price <= range.min) return 0;
  if (price >= range.profit) return SLIDER_MAX;

  let t: number;
  if (price <= range.balanced) {
    t = 0.5 * ((price - range.min) / (range.balanced - range.min));
  } else {
    t = 0.5 + 0.5 * ((price - range.balanced) / (range.profit - range.balanced));
  }
  return Math.round(t * SLIDER_MAX);
}

export function RecommendationSlider({
  priceRange,
  currentPrice,
  onPriceChange,
  onEditingChange,
}: Props) {
  const sliderValue = priceToSlider(currentPrice, priceRange);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const pos = parseInt(e.target.value, 10);
      const price = sliderToPrice(pos, priceRange);
      onPriceChange(price);
      onEditingChange(false);
    },
    [priceRange, onPriceChange, onEditingChange],
  );

  return (
    <div className="flex flex-col gap-2 px-1">
      <input
        type="range"
        min={0}
        max={SLIDER_MAX}
        step={1}
        value={sliderValue}
        onChange={handleChange}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-500 bg-gray-200"
      />
      <div className="flex justify-between text-xs font-semibold text-gray-400">
        <span>Швидко</span>
        <span>Баланс</span>
        <span>Вигідно</span>
      </div>
    </div>
  );
}
