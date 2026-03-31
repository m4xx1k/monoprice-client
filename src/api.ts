import type { PriceResult } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export async function initProduct(
  id: string,
  title: string,
  category: string,
  photos: File[],
): Promise<void> {
  const form = new FormData();
  form.append("id", id);
  form.append("title", title);
  form.append("category", category);
  for (const photo of photos) {
    form.append("photos", photo);
  }
  const res = await fetch(`${API_BASE}/v2/product/init`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Init failed" }));
    throw new Error(err.error);
  }
}

export async function getPrice(
  id: string,
  title: string,
  description: string,
  category?: number,
): Promise<PriceResult> {
  const res = await fetch(`${API_BASE}/v2/product/description`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title, description, category }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Pricing failed" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function cleanupProduct(id: string): Promise<void> {
  await fetch(`${API_BASE}/v2/product/cleanup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}
