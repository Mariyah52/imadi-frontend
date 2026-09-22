import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "primary",
  className = "",
  shortcutHint,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; shortcutHint?: string }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700";
  const variants: Record<Variant, string> = {
    primary: "bg-navy-800 text-white hover:bg-navy-700",
    secondary: "bg-white text-navy-800 border border-border hover:bg-navy-50",
    ghost: "text-navy-800 hover:bg-navy-50",
  };
  // The shortcut hint needs different contrast depending on the button's
  // background — light-on-dark for the solid navy button, dark-on-light
  // for the outlined/ghost ones.
  const kbdVariants: Record<Variant, string> = {
    primary: "border-white/30 bg-white/10 text-white/90",
    secondary: "border-border bg-surface text-ink-muted",
    ghost: "border-border bg-surface text-ink-muted",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      {shortcutHint && (
        <kbd
          className={`hidden rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-block ${kbdVariants[variant]}`}
        >
          {shortcutHint}
        </kbd>
      )}
    </button>
  );
}
