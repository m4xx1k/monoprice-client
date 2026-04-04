import type { EstimateResult } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://monoprice-api.up.railway.app";

export async function warmup(photos: File[]): Promise<void> {
  console.log(
    "warmup photos:",
    photos.map((f) => ({ name: f.name, type: f.type, size: f.size })),
  );
  const form = new FormData();
  for (const photo of photos) {
    form.append("photos", photo);
  }
  await fetch(`${API_BASE}/v2/product/warmup`, {
    method: "POST",
    body: form,
  });
}

export async function estimate(
  description: string,
  signal?: AbortSignal,
): Promise<EstimateResult> {
  console.log("estimate description:", description);
  const res = await fetch(`${API_BASE}/v2/product/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
    signal,
  });
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => "(unreadable)");
    }
    console.error("estimate error:", res.status, body);
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<EstimateResult>;
}