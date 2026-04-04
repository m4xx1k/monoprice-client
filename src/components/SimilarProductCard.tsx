import type { SoldProduct, ActiveProduct } from "../types";
import { formatPrice } from "../helpers";

// Fixed timestamp for active product duration calculation
const ACTIVE_FIXED_TS = new Date("2026-03-28T10:29:49.467203+00:00");

function daysApart(from: string, to: Date): number {
  const fromDate = new Date(from);
  const diffMs = to.getTime() - fromDate.getTime();
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

interface SoldCardProps {
  product: SoldProduct;
}

export function SoldProductCard({ product }: SoldCardProps) {
  const hasDiff = product.original_price !== product.sold_price;
  const durationDays = daysApart(product.created_at, new Date(product.updated_at));

  return (
    <div className="w-[160px] shrink-0 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Image */}
      <div className="w-full aspect-square bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
            📦
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight">
          {product.title}
        </p>

        <div className="flex items-center justify-between mt-auto pt-1 flex-wrap gap-1">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-blue-600">
              {formatPrice(product.sold_price)}
            </span>
            {hasDiff && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
            {durationDays} д.
          </span>
        </div>
      </div>
    </div>
  );
}

interface ActiveCardProps {
  product: ActiveProduct;
}

export function ActiveProductCard({ product }: ActiveCardProps) {
  const durationDays = daysApart(product.created_at, ACTIVE_FIXED_TS);

  return (
    <div className="w-[160px] shrink-0 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Image */}
      <div className="w-full aspect-square bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
            📦
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight">
          {product.title}
        </p>

        <div className="flex items-center justify-between mt-auto pt-1 flex-wrap gap-1">
          <span className="text-sm font-bold text-gray-800">
            {formatPrice(product.original_price)}
          </span>
          <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
            {durationDays} д.
          </span>
        </div>
      </div>
    </div>
  );
}
