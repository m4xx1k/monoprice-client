import { useState, useRef, useCallback, useEffect } from "react";
import { 
  ScanSearch, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  Package, 
  LayoutGrid, 
  FileText,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { initProduct, getPrice, cleanupProduct } from "./api";
import { uid } from "./helpers";
import type { PriceResult } from "./types";
import { Progress } from "./components/Progress";
import { PhotoPicker } from "./components/PhotoPicker";
import { Spinner } from "./components/Spinner";
import { StrategyCard } from "./components/StrategyCard";
import { EvidenceCard } from "./components/EvidenceCard";
import { MarketInsights } from "./components/MarketInsights";

const CATEGORIES: Record<string, string> = {
  "4": "Смартфони Apple",
  "512": "Кросівки",
  "743": "Конструктори",
  "795": "Книги та журнали",
  "1677": "Колекційні фігурки",
  "1261": "Шини, диски і колеса",
  "1320": "Меблі / Стільці",
};

/* ─── Step 1: Product info ─── */

function StepInfo({
  onNext,
}: {
  onNext: (data: { sessionId: string; title: string; category: string; photos: File[] }) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  const valid = title.trim().length > 1 && category && photos.length > 0;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onNext({ sessionId: uid(), title: title.trim(), category, photos });
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
            <Package size={14} className="text-violet-500" />
            Назва товару
          </label>
          <div className="relative group">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Наприклад: iPhone 14 Pro 128GB"
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white text-base font-medium outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="relative">
          <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
            <LayoutGrid size={14} className="text-violet-500" />
            Категорія
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white text-base font-medium outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition-all appearance-none cursor-pointer"
            >
              <option value="">Оберіть категорію</option>
              {Object.entries(CATEGORIES).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronRight size={18} className="rotate-90" />
            </div>
          </div>
        </div>

        <div>
          <PhotoPicker
            photos={photos}
            onAdd={(files) => setPhotos((p) => [...p, ...files].slice(0, 5))}
            onRemove={(i) => setPhotos((p) => p.filter((_, idx) => idx !== i))}
          />
        </div>
      </div>

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
  result: PriceResult;
  onReset: () => void;
  durationMs?: number;
}) {
  const { pricing, market_arguments, evidence } = result;
  const { fast, balanced, profit } = pricing.strategies;

  return (
    <div className="flex flex-col gap-8 pb-4">
      {/* Strategy cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <StrategyCard strategy={fast} color="emerald" />
        <StrategyCard strategy={balanced} color="violet" featured />
        <StrategyCard strategy={profit} color="amber" />
      </div>

      <div className="space-y-8">
        {/* Market insights */}
        <MarketInsights
          confidence={market_arguments.confidence_score}
          label={market_arguments.confidence_label}
          templates={market_arguments.templates}
        />

        {/* Evidence products */}
        {evidence.top_similar_products.length > 0 && (
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
                {evidence.total_found} знайдено
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 snap-x snap-mandatory no-scrollbar">
              {evidence.top_similar_products.map((p) => (
                <EvidenceCard key={p.external_id} product={p} />
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
  | { step: 1; sessionId: string; title: string; category: string; loading: boolean }
  | { step: 2; result: PriceResult; sessionId: string; durationMs?: number };

export default function App() {
  const [state, setState] = useState<FlowState>({ step: 0 });
  const [error, setError] = useState<string | null>(null);
  const initDone = useRef(false);

  const handleStep1 = useCallback(
    async (data: { sessionId: string; title: string; category: string; photos: File[] }) => {
      setError(null);
      setState({
        step: 1,
        sessionId: data.sessionId,
        title: data.title,
        category: data.category,
        loading: false,
      });

      initDone.current = false;
      try {
        await initProduct(data.sessionId, data.title, data.category, data.photos);
        initDone.current = true;
      } catch {
        initDone.current = true;
      }
    },
    [],
  );

  const handleStep2 = useCallback(
    async (description: string) => {
      if (state.step !== 1) return;
      setError(null);
      setState((s) => (s.step === 1 ? { ...s, loading: true } : s));

      const start = Date.now();
      try {
        const result = await getPrice(
          state.sessionId,
          state.title,
          description,
          Number(state.category),
        );
        const durationMs = Date.now() - start;
        setState({ step: 2, result, sessionId: state.sessionId, durationMs });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Щось пішло не так");
        setState((s) => (s.step === 1 ? { ...s, loading: false } : s));
      }
    },
    [state],
  );

  const handleReset = useCallback(() => {
    if (state.step === 2) {
      cleanupProduct(state.sessionId);
    }
    setState({ step: 0 });
    setError(null);
    initDone.current = false;
  }, [state]);

  const handleBack = useCallback(() => {
    if (state.step === 1) {
      cleanupProduct(state.sessionId);
    }
    setState({ step: 0 });
    setError(null);
    initDone.current = false;
  }, [state]);

  useEffect(() => {
    return () => {
      if (state.step >= 1 && "sessionId" in state) {
        cleanupProduct(state.sessionId);
      }
    };
  }, [state]);

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
