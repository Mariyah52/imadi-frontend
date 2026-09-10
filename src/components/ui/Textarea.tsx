import type { TextareaHTMLAttributes } from "react";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-navy-700/30 focus:border-navy-700 ${props.className ?? ""}`}
    />
  );
}
