import { useEffect, useState, type FormEvent } from "react";
import { addAddress, listAddresses, removeAddress } from "../../api/customers";
import { ApiError } from "../../api/client";
import type { Address, AddressType } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { useAuth } from "../../auth/AuthContext";

const ADDRESS_TYPES: AddressType[] = ["billing", "shipping", "registered"];

export function AddressesPanel({ customerId }: { customerId: string }) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("customers:edit");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [addressType, setAddressType] = useState<AddressType>("billing");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [countryCode, setCountryCode] = useState("GB");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    listAddresses(customerId)
      .then(setAddresses)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load addresses."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [customerId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addAddress(customerId, {
        address_type: addressType,
        line1,
        line2: line2 || undefined,
        city,
        postcode,
        country_code: countryCode,
      });
      setLine1("");
      setLine2("");
      setCity("");
      setPostcode("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add address.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await removeAddress(customerId, id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove address.");
    }
  }

  return (
    <div className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink-muted">Addresses</h2>
        {canEdit && (
          <Button variant="ghost" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Add address"}
          </Button>
        )}
      </div>

      {error && <p className="mb-2 text-sm text-negative">{error}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2 rounded-md bg-navy-50 p-3">
          <select
            value={addressType}
            onChange={(e) => setAddressType(e.target.value as AddressType)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm capitalize"
          >
            {ADDRESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Input placeholder="Address line 1" required value={line1} onChange={(e) => setLine1(e.target.value)} />
          <Input placeholder="Address line 2" value={line2} onChange={(e) => setLine2(e.target.value)} />
          <div className="flex gap-2">
            <Input placeholder="City" required value={city} onChange={(e) => setCity(e.target.value)} />
            <Input
              placeholder="Postcode"
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
          </div>
          <Input
            placeholder="Country code (e.g. GB)"
            maxLength={2}
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
          />
          <Button type="submit" disabled={submitting} className="self-start">
            {submitting ? "Adding…" : "Add"}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-ink-muted">No addresses yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {addresses.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="capitalize font-medium">{a.address_type}</span>
                {a.is_default && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-600">
                    Default
                  </span>
                )}
                <div className="text-xs text-ink-muted">
                  {[a.line1, a.line2, a.city, a.postcode, a.country_code].filter(Boolean).join(", ")}
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleRemove(a.id)}
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
