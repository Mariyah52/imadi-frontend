import { useEffect, useState, type FormEvent } from "react";
import { adjustStock, issueStock, listWarehouses, receiveStock } from "../../api/inventory";
import { ApiError } from "../../api/client";
import type { Warehouse } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

type Mode = "receive" | "issue" | "adjust";

const TITLES: Record<Mode, string> = {
  receive: "Receive stock",
  issue: "Issue stock",
  adjust: "Adjust stock",
};

export function StockActionModal({
  productId,
  mode,
  onClose,
  onDone,
}: {
  productId: string;
  mode: Mode;
  onClose: () => void;
  onDone: () => void;
}) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [batchNumber, setBatchNumber] = useState("DEFAULT");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listWarehouses()
      .then((ws) => {
        setWarehouses(ws);
        if (ws.length > 0) setWarehouseId(ws[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load warehouses."));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "receive") {
        await receiveStock({
          product_id: productId,
          warehouse_id: warehouseId,
          batch_number: batchNumber,
          quantity,
          reason: reason || undefined,
        });
      } else if (mode === "issue") {
        await issueStock({
          product_id: productId,
          warehouse_id: warehouseId,
          batch_number: batchNumber,
          quantity,
          reason: reason || undefined,
        });
      } else {
        await adjustStock({
          product_id: productId,
          warehouse_id: warehouseId,
          batch_number: batchNumber,
          quantity_delta: quantity,
          reason,
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't record the movement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">{TITLES[mode]}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Warehouse">
            <select
              required
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Batch number">
            <Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
          </Field>
          <Field label={mode === "adjust" ? "Quantity change (+/-)" : "Quantity"}>
            <Input
              type="number"
              step="0.01"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
          <Field label={mode === "adjust" ? "Reason (required)" : "Reason"}>
            <Input
              required={mode === "adjust"}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !warehouseId}>
              {submitting ? "Saving…" : "Confirm"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
