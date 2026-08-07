import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getVatReturn, recomputeVatReturn, submitVatReturn } from "../../api/vat";
import type { VatReturn } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { useAuth } from "../../auth/AuthContext";

function Box({ number, label, value }: { number: number; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-muted">{label}</span>
        <span className="font-mono-data text-[11px] text-ink-muted/70">Box {number}</span>
      </div>
      <div className="mt-1 font-mono-data text-lg font-semibold">{formatMoney(value)}</div>
    </Card>
  );
}

export function VatReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const [vatReturn, setVatReturn] = useState<VatReturn | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  function load() {
    if (!id) return;
    getVatReturn(id)
      .then(setVatReturn)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this VAT return."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleRecompute() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await recomputeVatReturn(id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't recompute the return.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await submitVatReturn(id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't submit the return.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!vatReturn || !id) return null;

  const isDraft = vatReturn.status === "draft";

  return (
    <div>
      <Link to="/vat/returns" className="text-sm text-navy-800 hover:underline">
        ← VAT returns
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">
            {vatReturn.period_start} → {vatReturn.period_end}
          </h1>
          {vatReturn.submitted_at && (
            <p className="text-sm text-ink-muted mt-1">
              Submitted {new Date(vatReturn.submitted_at).toLocaleString("en-GB")}
              {vatReturn.hmrc_receipt_reference && ` · Ref ${vatReturn.hmrc_receipt_reference}`}
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            isDraft ? "bg-navy-100 text-ink-muted" : "bg-positive-bg text-positive"
          }`}
        >
          {vatReturn.status}
        </span>
      </div>

      {actionError && <p className="mb-4 text-sm text-negative">{actionError}</p>}

      {isDraft && (
        <div className="mb-6 flex flex-wrap gap-2">
          {hasPermission("vat:manage") && (
            <Button variant="secondary" disabled={busy} onClick={handleRecompute}>
              Recompute
            </Button>
          )}
          {hasPermission("vat:submit") && (
            <Button disabled={busy} onClick={handleSubmit}>
              Submit return
            </Button>
          )}
        </div>
      )}

      <p className="mb-4 text-xs text-ink-muted">
        Submitting here marks the return as submitted and locks its figures — it does not call the
        real HMRC Making Tax Digital VAT API.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Box number={1} label="VAT due on sales" value={vatReturn.box1_vat_due_on_sales} />
        <Box number={2} label="VAT due on acquisitions" value={vatReturn.box2_vat_due_on_acquisitions} />
        <Box number={3} label="Total VAT due" value={vatReturn.box3_total_vat_due} />
        <Box number={4} label="VAT reclaimed" value={vatReturn.box4_vat_reclaimed} />
        <Box number={5} label="Net VAT due" value={vatReturn.box5_net_vat_due} />
        <Box number={6} label="Total sales (ex VAT)" value={vatReturn.box6_total_sales_ex_vat} />
        <Box number={7} label="Total purchases (ex VAT)" value={vatReturn.box7_total_purchases_ex_vat} />
        <Box number={8} label="EC supplies" value={vatReturn.box8_ec_supplies} />
        <Box number={9} label="EC acquisitions" value={vatReturn.box9_ec_acquisitions} />
      </div>
    </div>
  );
}
