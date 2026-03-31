import { Image as ImageIcon, ExternalLink, Calendar } from "lucide-react";
import type { EvidenceProduct } from "../types";
import { formatPrice } from "../helpers";

export function EvidenceCard({ product }: { product: EvidenceProduct }) {
  return (
    <div className="min-w-[160px] max-w-[160px] snap-start rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm shrink-0 transition-shadow hover:shadow-md">
      <div className="relative group/card">
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
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <ExternalLink size={10} />
        </div>
      </div>
      
      <div className="p-3">
        <div className="text-[11px] font-bold text-gray-900 line-clamp-2 leading-snug h-8">
          {product.title}
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-black text-violet-600">
            {formatPrice(product.sold_price)}
          </span>
          <div className="flex items-center gap-0.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
            <Calendar size={10} strokeWidth={2.5} />
            {product.days_to_sell}д
          </div>
        </div>
      </div>
    </div>
  );
}
