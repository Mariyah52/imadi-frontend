import { useRef } from "react";
import { useHotkey } from "./useHotkey";

/**
 * Standard keyboard behaviour for a modal (or any single-form page):
 * Escape closes it, Ctrl+Enter submits it. Returns a form ref — attach it
 * to the <form> element so Ctrl+Enter can trigger a real submit (this runs
 * the browser's native validation, same as clicking the submit button).
 *
 * Usage:
 *   const formRef = useModalHotkeys(onClose);
 *   <form ref={formRef} onSubmit={handleSubmit}>...
 *
 * If the modal has no close handler (e.g. a full page, not an overlay),
 * pass `undefined` and only the Ctrl+Enter submit shortcut is registered.
 */
export function useModalHotkeys(onClose?: () => void) {
  const formRef = useRef<HTMLFormElement>(null);

  useHotkey(
    { key: "Escape" },
    () => onClose?.(),
    { enabled: !!onClose }
  );
  useHotkey({ key: "Enter", ctrl: true }, () => {
    formRef.current?.requestSubmit();
  });

  return formRef;
}
