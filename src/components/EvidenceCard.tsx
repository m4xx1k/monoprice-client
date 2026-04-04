import { Image as ImageIcon } from "lucide-react";
import type { SoldProduct } from "../types";
import { formatPrice } from "../helpers";

function daysToSell(createdAt: string, updatedAt: string): number {
  return Math.max(
    1,
    Math.round(
      (new Date(updatedAt).getTime() - new Date(createdAt).getTime()) /
        86400000,
    ),
  );
}

export function EvidenceCard({ product }: { product: SoldProduct }) {
  const days = daysToSell(product.created_at, product.updated_at);

  return (
    <div className="min-w-[160px] max-w-[160px] snap-start rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm shrink-0 transition-shadow hover:shadow-md">
      <div className="relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt=""
            className="w-full h-28 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-28 bg-gray-50 flex items-center justify-center text-gray-300">
            <ImageIcon size={32} strokeWidth={1} />
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="text-[11px] font-bold text-gray-900 line-clamp-2 leading-snug h-8">
          {product.title}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-black text-violet-600">
            {formatPrice(product.sold_price)}
          </span>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
            {days}д
          </span>
        </div>
      </div>
    </div>
  );
}
