export type Strategy = {
  name: string;
  price: number;
  estimatedDays: string;
  badge?: string;
};

export type SoldProduct = {
  image_url: string;
  title: string;
  original_price: number;
  sold_price: number;
  created_at: string;
  updated_at: string;
};

export type ActiveProduct = {
  image_url: string;
  title: string;
  original_price: number;
  created_at: string;
};

export type EstimateResult = {
  price: {
    min: number;
    balanced: number;
    profit: number;
  };
  days_to_sell: {
    min: number;
    max: number;
  };
  statistics: {
    bargain_percentage: number;
  };
  similar_products: {
    sold: SoldProduct[];
    active: ActiveProduct[];
  };
};