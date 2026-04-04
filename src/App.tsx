import { useState, useCallback } from "react";
import {
  ScanSearch,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Package,
  FileText,
  Info,
  AlertCircle,
} from "lucide-react";
import { warmup, estimate } from "./api";
import type { EstimateResult } from "./types";
import { Progress } from "./components/Progress";
import { PhotoPicker } from "./components/PhotoPicker";
import { Spinner } from "./components/Spinner";
import { StrategyCard } from "./components/StrategyCard";
import { EvidenceCard } from "./components/EvidenceCard";

/* ─── Step 1: Photos ─── */

function StepInfo({ onNext }: { onNext: (photos: File[]) => void }) {
  const [photos, setPhotos] = useState<File[]>([]);
  const valid = photos.length > 0;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onNext(photos);
      }}
    >
      <PhotoPicker
        photos={photos}
        onAdd={(files) => setPhotos((p) => [...p, ...files].slice(0, 5))}
        onRemove={(i) => setPhotos((p) => p.filter((_, idx) => idx !== i))}
      />

      <button
        type="submit"
        disabled={!valid}
        className="group mt-2 w-full py-4 rounded-2xl bg-violet-600 text-white font-bold text-base shadow-xl shadow-violet-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed hover:bg-violet-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <span>Далі</span>
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
}

/* ─── Step 2: Description ─── */

function StepDescription({
  loading,
  onSubmit,
  onBack,
}: {
  loading: boolean;
  onSubmit: (description: string) => void;
  onBack: () => void;
}) {
  const [desc, setDesc] = useState("");

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (desc.trim()) onSubmit(desc.trim());
      }}
    >
      <div>
        <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
          <FileText size={14} className="text-violet-500" />
          Опис товару
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={6}
          placeholder="Опишіть стан, комплектацію, особливості товару..."
          className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white text-base font-medium outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition-all resize-none placeholder:text-gray-300"
        />
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={!desc.trim() || loading}
          className="w-full py-4 rounded-2xl bg-violet-600 text-white font-bold text-base shadow-xl shadow-violet-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed hover:bg-violet-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Spinner />
              <span className="animate-pulse">Аналізуємо ринок...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Оцінити товар</span>
            </>
          )}
        </button>

        {!loading && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-2xl text-gray-400 font-bold text-[13px] uppercase tracking-widest hover:text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            Назад
          </button>
        )}
      </div>
    </form>
  );
}

/* ─── Step 3: Results ─── */

function StepResults({
  result,
  onReset,
  durationMs,
}: {
  result: EstimateResult;
  onReset: () => void;
  durationMs?: number;
}) {
  const { price, days_to_sell, statistics, similar_products } = result;
  const { bargain_percentage } = statistics;

  const bargainMessage =
    bargain_percentage >= 30
      ? `У цій категорії ${bargain_percentage}% покупців торгуються. Рекомендуємо встановити ціну трохи вище — з розрахунком на знижку.`
      : "У цій категорії покупці рідко торгуються. Встановлена ціна скоріш за все буде фінальною.";

  const midDays = Math.round((days_to_sell.min + days_to_sell.max) / 2);

  const strategies = [
    { name: "Швидко", price: price.min, estimatedDays: `~${days_to_sell.min} дні` },
    { name: "Баланс", price: price.balanced, estimatedDays: `~${midDays} дні` },
    { name: "Вигідно", price: price.profit, estimatedDays: `~${days_to_sell.max} днів` },
  ] as const;

  return (
    <div className="flex flex-col gap-8 pb-4">
      {/* Strategy cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <StrategyCard strategy={strategies[0]} color="emerald" />
        <StrategyCard strategy={strategies[1]} color="violet" featured />
        <StrategyCard strategy={strategies[2]} color="amber" />
      </div>

      <div className="space-y-8">
        {/* Bargain insight */}
        <div className="flex gap-3 items-start p-4 rounded-2xl bg-amber-50 border border-amber-100">
          <div className="min-w-[32px] h-8 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Info size={16} />
          </div>
          <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
            {bargainMessage}
          </p>
        </div>

        {/* Similar sold products */}
        {similar_products.sold.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-100 text-violet-600">
                  <Package size={16} />
                </div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                  Схожі продані товари
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                {similar_products.sold.length} знайдено
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 snap-x snap-mandatory no-scrollbar">
              {similar_products.sold.map((p, i) => (
                <EvidenceCard key={i} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-base shadow-xl shadow-gray-200 hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw size={18} />
        Нова оцінка
      </button>

      {durationMs !== undefined && (
        <div className="text-center -mt-4">
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            час відповіді: {durationMs}ms
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main App ─── */

type FlowState =
  | { step: 0 }
  | { step: 1; loading: boolean }
  | { step: 2; result: EstimateResult; durationMs?: number };

export default function App() {
  const [state, setState] = useState<FlowState>({ step: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleStep1 = useCallback((photos: File[]) => {
    setError(null);
    setState({ step: 1, loading: false });
    warmup(photos).catch(() => {});
  }, []);

  const handleStep2 = useCallback(
    async (description: string) => {
      if (state.step !== 1) return;
      setError(null);
      setState({ step: 1, loading: true });

      const start = Date.now();
      try {
        const result = await estimate(description);
        const durationMs = Date.now() - start;
        setState({ step: 2, result, durationMs });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Щось пішло не так");
        setState({ step: 1, loading: false });
      }
    },
    [state],
  );

  const handleReset = useCallback(() => {
    setState({ step: 0 });
    setError(null);
  }, []);

  const handleBack = useCallback(() => {
    setState({ step: 0 });
    setError(null);
  }, []);

  return (
    <div className="min-h-dvh bg-white sm:bg-gray-50 selection:bg-violet-100 selection:text-violet-900">
      <div className="mx-auto max-w-lg min-h-dvh flex flex-col">
        <header className="px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-violet-600 text-white shadow-xl shadow-violet-200">
            <ScanSearch size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
            Monopricer
          </h1>
          <p className="text-[13px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
            AI оцінка вартості товарів
          </p>
        </header>

        <main className="flex-1 px-6 pb-12">
          <div className="bg-white rounded-[32px] sm:shadow-2xl sm:shadow-gray-200/50 sm:border sm:border-gray-100 p-1">
            <div className="px-2 pt-6">
              <Progress step={state.step} />
            </div>

            <div className="p-4">
              {error && (
                <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-300">
                  <AlertCircle size={20} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {state.step === 0 && <StepInfo onNext={handleStep1} />}
                {state.step === 1 && (
                  <StepDescription
                    loading={state.loading}
                    onSubmit={handleStep2}
                    onBack={handleBack}
                  />
                )}
                {state.step === 2 && (
                  <StepResults
                    result={state.result}
                    onReset={handleReset}
                    durationMs={state.durationMs}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="py-8 text-center px-6">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
            Powered by Advanced AI Pricing Engine
          </p>
        </footer>
      </div>
    </div>
  );
}