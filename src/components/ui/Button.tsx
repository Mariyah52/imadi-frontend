import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700";
  const variants: Record<Variant, string> = {
    primary: "bg-navy-800 text-white hover:bg-navy-700",
    secondary: "bg-white text-navy-800 border border-border hover:bg-navy-50",
    ghost: "text-navy-800 hover:bg-navy-50",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
