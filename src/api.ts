import type { EstimateResult } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://monoprice-api.up.railway.app";

export async function warmup(photos: File[]): Promise<void> {
  const form = new FormData();
  for (const photo of photos) {
    form.append("photos", photo);
  }
  await fetch(`${API_BASE}/v2/product/warmup`, {
    method: "POST",
    body: form,
  });
}

export async function estimate(description: string): Promise<EstimateResult> {
  const res = await fetch(`${API_BASE}/v2/product/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Pricing failed" }));
    throw new Error(err.error);
  }
  return res.json();
}
