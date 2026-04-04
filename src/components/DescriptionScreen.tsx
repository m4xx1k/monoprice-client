import { useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { estimate } from "../api";
import type { EstimateResult } from "../types";

interface Props {
  description: string;
  onDescriptionChange: (desc: string) => void;
  onBack: () => void;
  onGoToRecommendation: (
    opts:
      | { kind: "immediate"; result: EstimateResult }
      | { kind: "pending"; submittedDescription: string },
  ) => void;
  onLatestSubmittedDescriptionChange: (desc: string) => void;
}

const MIN_CHARS = 10;

function countNonWhitespace(s: string): number {
  return s.replace(/\s/g, "").length;
}

export function DescriptionScreen({
  description,
  onDescriptionChange,
  onBack,
  onGoToRecommendation,
  onLatestSubmittedDescriptionChange,
}: Props) {
  // All mutable state lives in refs to avoid stale closures
  const descriptionRef = useRef(description);
  const lastCompletedResultRef = useRef<EstimateResult | null>(null);
  const lastCompletedDescriptionRef = useRef<string>("");
  const inFlightControllerRef = useRef<AbortController | null>(null);
  const streamingScheduledRef = useRef(false);
  const requestCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLatestSubmittedRef = useRef(onLatestSubmittedDescriptionChange);

  // Keep refs in sync with latest prop values
  useEffect(() => {
    descriptionRef.current = description;
  }, [description]);

  useEffect(() => {
    onLatestSubmittedRef.current = onLatestSubmittedDescriptionChange;
  }, [onLatestSubmittedDescriptionChange]);

  // Use a ref for scheduleNext and fireRequest so they can call each other
  // without stale closure issues
  const scheduleNextRef = useRef<() => void>(() => {});
  const fireRequestRef = useRef<() => void>(() => {});

  // Set up the actual implementations once (they read from refs, no stale closures)
  useEffect(() => {
    function getDelay(): number {
      const count = requestCountRef.current;
      if (count === 0) return 3000;
      if (count === 1) return 2000;
      return 1000;
    }

    function scheduleNext() {
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const desc = descriptionRef.current.trim();
      if (!desc || countNonWhitespace(desc) < MIN_CHARS) {
        streamingScheduledRef.current = false;
        return;
      }

      streamingScheduledRef.current = true;
      const delay = getDelay();

      timerRef.current = setTimeout(() => {
        streamingScheduledRef.current = false;
        timerRef.current = null;

        const currentDesc = descriptionRef.current.trim();
        if (!currentDesc || countNonWhitespace(currentDesc) < MIN_CHARS) return;

        if (inFlightControllerRef.current) {
          // Still in flight — reschedule to check again shortly
          timerRef.current = setTimeout(scheduleNext, 500);
          return;
        }

        if (currentDesc === lastCompletedDescriptionRef.current) {
          // Nothing new
          return;
        }

        fireRequestRef.current();
      }, delay);
    }

    async function fireRequest() {
      const desc = descriptionRef.current.trim();
      if (!desc || countNonWhitespace(desc) < MIN_CHARS) return;
      if (desc === lastCompletedDescriptionRef.current) return;

      // Abort any previous in-flight
      if (inFlightControllerRef.current) {
        inFlightControllerRef.current.abort();
      }

      const controller = new AbortController();
      inFlightControllerRef.current = controller;
      onLatestSubmittedRef.current(desc);

      try {
        const result = await estimate(desc, controller.signal);
        if (controller.signal.aborted) return;
        lastCompletedResultRef.current = result;
        lastCompletedDescriptionRef.current = desc;
        requestCountRef.current += 1;
        inFlightControllerRef.current = null;
        scheduleNextRef.current();
      } catch {
        if (!controller.signal.aborted) {
          inFlightControllerRef.current = null;
          scheduleNextRef.current();
        }
      }
    }

    scheduleNextRef.current = scheduleNext;
    fireRequestRef.current = fireRequest;
  }, []); // Only run once — functions read from refs, no deps needed

  // Watch description changes to manage streaming lifecycle
  useEffect(() => {
    const trimmed = description.trim();

    if (!trimmed || countNonWhitespace(trimmed) < MIN_CHARS) {
      // Cancel everything
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (inFlightControllerRef.current) {
        inFlightControllerRef.current.abort();
        inFlightControllerRef.current = null;
      }
      streamingScheduledRef.current = false;
      return;
    }

    // Schedule first request when description first becomes valid
    if (
      requestCountRef.current === 0 &&
      !streamingScheduledRef.current &&
      !inFlightControllerRef.current
    ) {
      scheduleNextRef.current();
    }
    // If a timer is already running or request in-flight,
    // it will read the latest description from descriptionRef when it fires
  }, [description]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (inFlightControllerRef.current) inFlightControllerRef.current.abort();
    };
  }, []);

  const handleCTA = useCallback(() => {
    const trimmed = description.trim();
    if (countNonWhitespace(trimmed) < MIN_CHARS) return;

    // Stop streaming
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (inFlightControllerRef.current) {
      inFlightControllerRef.current.abort();
      inFlightControllerRef.current = null;
    }
    streamingScheduledRef.current = false;

    if (lastCompletedResultRef.current !== null) {
      // Case A: already have a result
      onGoToRecommendation({ kind: "immediate", result: lastCompletedResultRef.current });
    } else {
      // Case B: no result yet — fire fresh and show loading
      onGoToRecommendation({ kind: "pending", submittedDescription: trimmed });
    }
  }, [description, onGoToRecommendation]);

  const trimmedDesc = description.trim();
  const isValid = countNonWhitespace(trimmedDesc) >= MIN_CHARS;

  return (
    <div className="min-h-dvh flex flex-col bg-[#F2F2F7]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-bold text-gray-900">Опис вашого товару</h1>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-6 flex flex-col gap-4">
        <textarea
          autoFocus
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={"Коротко про стан, модель або\nінше важливе"}
          className="flex-1 w-full px-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-blue-500 focus:outline-none text-base font-medium placeholder:text-gray-300 resize-none min-h-[200px] transition-colors"
        />
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-8">
        <button
          type="button"
          onClick={handleCTA}
          disabled={!isValid}
          className="w-full py-4 rounded-full bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          Оцінити товар
        </button>
      </div>
    </div>
  );
}
