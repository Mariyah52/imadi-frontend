import { useEffect, useState, type FormEvent } from "react";
import { addContact, listContacts, removeContact } from "../../api/customers";
import { ApiError } from "../../api/client";
import type { Contact } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { useAuth } from "../../auth/AuthContext";

export function ContactsPanel({ customerId }: { customerId: string }) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("customers:edit");

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    listContacts(customerId)
      .then(setContacts)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load contacts."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [customerId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addContact(customerId, {
        name,
        job_title: jobTitle || undefined,
        email: email || undefined,
        phone: phone || undefined,
      });
      setName("");
      setJobTitle("");
      setEmail("");
      setPhone("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add contact.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await removeContact(customerId, id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove contact.");
    }
  }

  return (
    <div className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink-muted">Contacts</h2>
        {canEdit && (
          <Button variant="ghost" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Add contact"}
          </Button>
        )}
      </div>

      {error && <p className="mb-2 text-sm text-negative">{error}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2 rounded-md bg-navy-50 p-3">
          <Input placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            placeholder="Job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button type="submit" disabled={submitting} className="self-start">
            {submitting ? "Adding…" : "Add"}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-ink-muted">No contacts yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {contacts.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{c.name}</span>
                {c.job_title && <span className="text-ink-muted"> — {c.job_title}</span>}
                {c.is_primary && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-600">
                    Primary
                  </span>
                )}
                <div className="text-xs text-ink-muted">
                  {[c.email, c.phone].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleRemove(c.id)}
                  className="text-xs text-negative hover:underline"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
