import { useState, useCallback } from "react";
import type { EstimateResult } from "./types";
import { PhotoScreen } from "./components/PhotoScreen";
import { DescriptionScreen } from "./components/DescriptionScreen";
import { RecommendationScreen } from "./components/RecommendationScreen";
import { estimate } from "./api";

export default function App() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [recommendation, setRecommendation] = useState<EstimateResult | null>(null);
  const [isWaitingForRecommendation, setIsWaitingForRecommendation] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isPriceEditing, setIsPriceEditing] = useState(false);
  const [similarProductsTab, setSimilarProductsTab] = useState<"sold" | "active">("sold");
  const [recommendationLoadingStartedAt, setRecommendationLoadingStartedAt] = useState<
    number | null
  >(null);
  const [lastRecommendationRequestLatency, setLastRecommendationRequestLatency] = useState<
    number | null
  >(null);
  const [lastRecommendationLoadingDuration, setLastRecommendationLoadingDuration] = useState<
    number | null
  >(null);
  const [latestSubmittedDescription, setLatestSubmittedDescription] = useState("");

  const reset = useCallback(() => {
    setStep(0);
    setSelectedPhotos([]);
    setDescription("");
    setRecommendation(null);
    setIsWaitingForRecommendation(false);
    setCurrentPrice(0);
    setIsPriceEditing(false);
    setSimilarProductsTab("sold");
    setRecommendationLoadingStartedAt(null);
    setLastRecommendationRequestLatency(null);
    setLastRecommendationLoadingDuration(null);
    setLatestSubmittedDescription("");
  }, []);

  // Called by DescriptionScreen when user presses CTA
  const handleGoToRecommendation = useCallback(
    (
      opts:
        | { kind: "immediate"; result: EstimateResult }
        | { kind: "pending"; submittedDescription: string },
    ) => {
      if (opts.kind === "immediate") {
        setRecommendation(opts.result);
        setIsWaitingForRecommendation(false);
        setRecommendationLoadingStartedAt(null);
        setLastRecommendationLoadingDuration(null);
      } else {
        const startedAt = Date.now();
        setRecommendationLoadingStartedAt(startedAt);
        setIsWaitingForRecommendation(true);
        setRecommendation(null);
        setLatestSubmittedDescription(opts.submittedDescription);
        estimate(opts.submittedDescription)
          .then((result) => {
            const latency = Date.now() - startedAt;
            const loaderDuration = Date.now() - startedAt;
            setRecommendation(result);
            setIsWaitingForRecommendation(false);
            setLastRecommendationRequestLatency(latency);
            setLastRecommendationLoadingDuration(loaderDuration);
            setRecommendationLoadingStartedAt(null);
          })
          .catch(() => {
            setIsWaitingForRecommendation(false);
            setRecommendationLoadingStartedAt(null);
          });
      }
      setStep(2);
    },
    [],
  );

  return (
    <div className="min-h-dvh bg-[#F2F2F7]">
      {step === 0 && (
        <PhotoScreen
          selectedPhotos={selectedPhotos}
          onPhotosChange={setSelectedPhotos}
          onReset={reset}
          onNext={(photos) => {
            setSelectedPhotos(photos);
            setStep(1);
          }}
        />
      )}
      {step === 1 && (
        <DescriptionScreen
          description={description}
          onDescriptionChange={setDescription}
          onBack={() => setStep(0)}
          onGoToRecommendation={handleGoToRecommendation}
          onLatestSubmittedDescriptionChange={setLatestSubmittedDescription}
        />
      )}
      {step === 2 && (
        <RecommendationScreen
          recommendation={recommendation}
          isWaitingForRecommendation={isWaitingForRecommendation}
          currentPrice={currentPrice}
          onCurrentPriceChange={setCurrentPrice}
          isPriceEditing={isPriceEditing}
          onIsPriceEditingChange={setIsPriceEditing}
          similarProductsTab={similarProductsTab}
          onSimilarProductsTabChange={setSimilarProductsTab}
          recommendationLoadingStartedAt={recommendationLoadingStartedAt}
          lastRecommendationRequestLatency={lastRecommendationRequestLatency}
          lastRecommendationLoadingDuration={lastRecommendationLoadingDuration}
          onBack={() => setStep(1)}
          onReset={reset}
        />
      )}
    </div>
  );
}
