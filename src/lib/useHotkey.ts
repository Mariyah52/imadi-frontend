import { useEffect, useRef } from "react";

export type Hotkey = {
  /** The main key, e.g. "l", "Enter", "Escape". Case-insensitive for letters. */
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
};

/**
 * Registers a keyboard shortcut for as long as the calling component is
 * mounted. This is the single place shortcut-matching logic lives, so every
 * page in the app wires shortcuts the same way — see CreateInvoicePage for
 * a reference usage, and ProductLineInput for arrow-key list navigation.
 *
 * By default the shortcut fires even while an input/textarea is focused,
 * since most of these shortcuts exist specifically to avoid reaching for
 * the mouse mid-form. Pass `ignoreInInputs: true` for shortcuts that would
 * otherwise interfere with normal typing (e.g. a bare "n" key).
 */
export function useHotkey(
  hotkey: Hotkey,
  handler: () => void,
  options: { enabled?: boolean; ignoreInInputs?: boolean } = {}
) {
  const { enabled = true, ignoreInInputs = false } = options;

  // Keep the latest handler in a ref so the listener doesn't need to be
  // torn down and re-added every render just because a new closure was
  // passed in.
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingField =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if (ignoreInInputs && isTypingField) return;

      const keyMatches = event.key.toLowerCase() === hotkey.key.toLowerCase();
      // Treat Ctrl (Windows/Linux) and Cmd (Mac) as the same "primary
      // modifier" so the same shortcut works cross-platform.
      const ctrlMatches = !!hotkey.ctrl === (event.ctrlKey || event.metaKey);
      const altMatches = !!hotkey.alt === event.altKey;
      const shiftMatches = !!hotkey.shift === event.shiftKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
        event.preventDefault();
        handlerRef.current();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hotkey.key, hotkey.ctrl, hotkey.alt, hotkey.shift, enabled, ignoreInInputs]);
}

/** Human-readable label for a hotkey, e.g. "Alt L", "Ctrl Enter". Used for
 * the little `<kbd>` hint shown on buttons that have a shortcut. */
export function formatHotkey(hotkey: Hotkey): string {
  const parts: string[] = [];
  if (hotkey.ctrl) parts.push("Ctrl");
  if (hotkey.alt) parts.push("Alt");
  if (hotkey.shift) parts.push("Shift");
  parts.push(hotkey.key.length === 1 ? hotkey.key.toUpperCase() : hotkey.key);
  return parts.join(" ");
}
