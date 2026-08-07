export function formatMoney(value: string | number, currency = "GBP") {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export function currentQuarter() {
  const d = new Date();
  const qStartMonth = Math.floor(d.getMonth() / 3) * 3;
  const start = new Date(d.getFullYear(), qStartMonth, 1);
  const end = new Date(d.getFullYear(), qStartMonth + 3, 0);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}
