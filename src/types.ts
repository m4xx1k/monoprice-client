export type Strategy = {
  name: string;
  expected_revenue: number;
  recommended_listing_price: number;
  estimated_days: string;
  badge?: string;
};

export type MarketTemplate = {
  icon: string;
  title: string;
  text: string;
};

export type EvidenceProduct = {
  external_id: string;
  title: string;
  original_price: number;
  sold_price: number;
  similarity: number;
  days_to_sell: number;
  image_url: string | null;
};

export type PriceResult = {
  pricing: {
    strategies: {
      fast: Strategy;
      balanced: Strategy;
      profit: Strategy;
    };
  };
  market_arguments: {
    confidence_score: number;
    confidence_label: string;
    templates: MarketTemplate[];
  };
  evidence: {
    total_found: number;
    top_similar_products: EvidenceProduct[];
  };
};
