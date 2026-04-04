export function uid() {
  return crypto.randomUUID();
}

export function formatPrice(n: number) {
  return n.toLocaleString("uk-UA") + "\u00A0\u20B4";
}

export function pluralizeDays(n: number): string {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 14) return "днів";
  if (mod10 === 1) return "день";
  if (mod10 >= 2 && mod10 <= 4) return "дні";
  return "днів";
}

export function formatDecimal(n: number): string {
  return n.toFixed(2).replace(",", ".");
}