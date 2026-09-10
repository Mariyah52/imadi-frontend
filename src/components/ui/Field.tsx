import type { InputHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-negative">{error}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-navy-700/30 focus:border-navy-700 ${props.className ?? ""}`}
    />
  );
}
