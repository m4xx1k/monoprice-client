export type SoldProduct = {
  image_url: string | null;
  title: string;
  original_price: number;
  sold_price: number;
  created_at: string;
  updated_at: string;
};

export type ActiveProduct = {
  image_url: string | null;
  title: string;
  original_price: number;
  created_at: string;
};

export type EstimateResult = {
  price?: { min: number; balanced: number; profit: number } | null;
  days_to_sell?: { min: number; max: number } | null;
  statistics?: { bargain_percentage?: number | null } | null;
  similar_products?: {
    sold?: SoldProduct[] | null;
    active?: ActiveProduct[] | null;
  } | null;
  explanation?: string | null;
};