export function uid() {
  return crypto.randomUUID();
}

export function formatPrice(n: number) {
  return n.toLocaleString("uk-UA") + " \u20B4";
}
