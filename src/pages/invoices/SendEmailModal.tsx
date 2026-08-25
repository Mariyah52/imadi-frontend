import { useState, type FormEvent } from "react";
import { emailInvoice } from "../../api/invoices";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { Textarea } from "../../components/ui/Textarea";

export function SendEmailModal({
  invoiceId,
  defaultEmail,
  onClose,
  onSent,
}: {
  invoiceId: string;
  defaultEmail: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [toEmail, setToEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await emailInvoice(invoiceId, toEmail.trim(), message.trim() || undefined, attachment ?? undefined);
      onSent();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Send invoice by email</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Recipient email">
            <Input
              type="email"
              required
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
            />
          </Field>
          <Field label="Message (optional)">
            <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
          <Field label="Attach a file (optional)">
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-navy-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-navy-100/70"
            />
            {attachment && (
              <p className="mt-1 text-xs text-ink-muted">
                {attachment.name} ({(attachment.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
