import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import type { EstimateResult } from "../types";
import { PriceEditor } from "./PriceEditor";
import { RecommendationSlider } from "./RecommendationSlider";
import { BargainHint } from "./BargainHint";
import { SimilarProductsTabs } from "./SimilarProductsTabs";
import { pluralizeDays } from "../helpers";

interface Props {
  recommendation: EstimateResult | null;
  isWaitingForRecommendation: boolean;
  currentPrice: number;
  onCurrentPriceChange: (price: number) => void;
  isPriceEditing: boolean;
  onIsPriceEditingChange: (editing: boolean) => void;
  similarProductsTab: "sold" | "active";
  onSimilarProductsTabChange: (tab: "sold" | "active") => void;
  recommendationLoadingStartedAt: number | null;
  lastRecommendationRequestLatency: number | null;
  lastRecommendationLoadingDuration: number | null;
  onBack: () => void;
  onReset: () => void;
}

function computeDaysToSell(price: EstimateResult["price"], days_to_sell: EstimateResult["days_to_sell"], currentPrice: number): number | null {
  if (!price || !days_to_sell) return null;
  const { min: priceMin, profit: priceMax } = price;
  const { min: daysMin, max: daysMax } = days_to_sell;
  if (priceMax <= priceMin) return daysMin;

  const clampedPrice = Math.max(priceMin, Math.min(priceMax, currentPrice));
  const t = (clampedPrice - priceMin) / (priceMax - priceMin);
  const days = daysMin + t * (daysMax - daysMin);
  return Math.max(1, Math.round(days));
}

export function RecommendationScreen({
  recommendation,
  isWaitingForRecommendation,
  currentPrice,
  onCurrentPriceChange,
  isPriceEditing,
  onIsPriceEditingChange,
  similarProductsTab,
  onSimilarProductsTabChange,
  recommendationLoadingStartedAt,
  lastRecommendationRequestLatency,
  lastRecommendationLoadingDuration,
  onBack,
  onReset,
}: Props) {
  // Live loader duration counter
  const [liveLoaderSeconds, setLiveLoaderSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isWaitingForRecommendation && recommendationLoadingStartedAt !== null) {
      const startedAt = recommendationLoadingStartedAt;
      intervalRef.current = setInterval(() => {
        setLiveLoaderSeconds((Date.now() - startedAt) / 1000);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isWaitingForRecommendation, recommendationLoadingStartedAt]);

  // Set default price when recommendation arrives
  useEffect(() => {
    if (recommendation?.price && currentPrice === 0) {
      onCurrentPriceChange(recommendation.price.balanced);
    }
  }, [recommendation, currentPrice, onCurrentPriceChange]);

  const priceRange = recommendation?.price ?? null;
  const bargainPercentage = recommendation?.statistics?.bargain_percentage ?? null;
  const soldProducts = recommendation?.similar_products?.sold ?? [];
  const activeProducts = recommendation?.similar_products?.active ?? [];
  const hasSimilar = soldProducts.length > 0 || activeProducts.length > 0;

  const daysToSell = computeDaysToSell(recommendation?.price, recommendation?.days_to_sell, currentPrice);

  // Timing label
  const lastLatencyStr = lastRecommendationRequestLatency !== null
    ? (lastRecommendationRequestLatency / 1000).toFixed(1)
    : "0.0";

  const loaderDurationStr = isWaitingForRecommendation
    ? liveLoaderSeconds.toFixed(1)
    : lastRecommendationLoadingDuration !== null
    ? (lastRecommendationLoadingDuration / 1000).toFixed(1)
    : "0.0";

  // CTA enabled: has result, OR has manual price and not waiting
  const ctaEnabled =
    recommendation !== null ||
    (currentPrice > 0 && !isWaitingForRecommendation);

  return (
    <div className="min-h-dvh flex flex-col bg-[#F2F2F7]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-bold text-gray-900">Яка ціна вашого товару?</h1>
        <div className="w-9" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-5 flex flex-col gap-5">
          {/* Commission */}
          <p className="text-center text-sm text-gray-500 font-medium">Комісія базару – 1.9%</p>

          {/* Price editor */}
          <div className="bg-white rounded-3xl p-5 flex flex-col gap-4">
            <PriceEditor
              price={currentPrice}
              onPriceChange={onCurrentPriceChange}
              isEditing={isPriceEditing}
              onEditingChange={onIsPriceEditingChange}
            />

            {/* Days to sell */}
            {daysToSell !== null && (
              <p className="text-center text-sm text-gray-500 font-medium">
                ~{daysToSell} {pluralizeDays(daysToSell)} до продажу
              </p>
            )}

            {/* Slider */}
            {priceRange && (
              <RecommendationSlider
                priceRange={priceRange}
                currentPrice={currentPrice}
                onPriceChange={onCurrentPriceChange}
                onEditingChange={onIsPriceEditingChange}
              />
            )}
          </div>

          {/* Loading state */}
          {isWaitingForRecommendation && (
            <div className="bg-white rounded-3xl p-5 flex flex-col items-center gap-3">
              <Loader2 size={28} className="text-blue-500 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Аналізуємо опис та фото,</p>
                <p className="text-sm font-semibold text-gray-700">щоб запропонувати найкращу ціну</p>
              </div>
            </div>
          )}

          {/* Timing label */}
          <p className="text-center text-[11px] font-mono text-gray-400">
            {lastLatencyStr}s | {loaderDurationStr}s
          </p>

          {/* Bargain hint */}
          {bargainPercentage !== null && <BargainHint bargainPercentage={bargainPercentage} />}

          {/* Similar products */}
          {hasSimilar && (
            <SimilarProductsTabs
              sold={soldProducts}
              active={activeProducts}
              activeTab={similarProductsTab}
              onTabChange={onSimilarProductsTabChange}
            />
          )}
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7] to-transparent">
        <button
          type="button"
          onClick={onReset}
          disabled={!ctaEnabled}
          className="w-full py-4 rounded-full bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          Згенерувати оголошення
        </button>
      </div>
    </div>
  );
}
