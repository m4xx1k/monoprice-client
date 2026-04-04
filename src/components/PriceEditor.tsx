import { useState, useRef, useCallback, useEffect } from "react";
import { formatDecimal } from "../helpers";

interface Props {
  price: number;
  onPriceChange: (price: number) => void;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
}

export function PriceEditor({ price, onPriceChange, isEditing, onEditingChange }: Props) {
  const [inputValue, setInputValue] = useState(price === 0 ? "" : String(price));
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep inputValue in sync when price changes externally (e.g. slider)
  useEffect(() => {
    if (!isEditing) {
      setInputValue(price === 0 ? "" : String(price));
    }
  }, [price, isEditing]);

  const handleContainerClick = useCallback(() => {
    onEditingChange(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [onEditingChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      if (raw === "") {
        setInputValue("");
        onPriceChange(0);
        return;
      }
      // Remove leading zeros
      const stripped = String(parseInt(raw, 10));
      setInputValue(stripped);
      onPriceChange(parseInt(stripped, 10));
    },
    [onPriceChange],
  );

  const handleBlur = useCallback(() => {
    onEditingChange(false);
    setInputValue(price === 0 ? "" : String(price));
  }, [onEditingChange, price]);

  const displayValue = isEditing ? inputValue : price === 0 ? "0" : String(price);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Price display / edit */}
      <div
        className="flex items-baseline justify-center cursor-text"
        style={{ whiteSpace: "nowrap" }}
        onClick={handleContainerClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className="text-5xl font-black text-gray-900 text-center bg-transparent outline-none border-none w-[6ch] min-w-[2ch] max-w-[10ch]"
            style={{ width: `${Math.max(2, displayValue.length)}ch` }}
          />
        ) : (
          <span className="text-5xl font-black text-gray-900">{displayValue}</span>
        )}
        <span className="text-4xl font-black text-gray-900 ml-1">₴</span>
      </div>

      {/* Net revenue */}
      {price > 0 && (
        <p className="text-sm text-gray-500 font-medium">
          Вам зарахується –{" "}
          <span className="font-bold text-gray-700">{formatDecimal(price * 0.981)} ₴</span>
        </p>
      )}
    </div>
  );
}
