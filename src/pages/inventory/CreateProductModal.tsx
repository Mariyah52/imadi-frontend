import { useEffect, useState, type FormEvent } from "react";
import { createProduct, listCategories } from "../../api/inventory";
import { ApiError } from "../../api/client";
import type { Category } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function CreateProductModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  // Cost price isn't shown on this form — the backend still accepts it, so
  // send a 0 default rather than requiring users to enter a figure they
  // don't want tracked here.
  const costPrice = "0";
  const [sellingPrice, setSellingPrice] = useState("0");
  const [minimumStock, setMinimumStock] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {
        /* categories are optional on the form — fall back to none listed */
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createProduct({
        sku,
        name,
        category_id: categoryId || undefined,
        cost_price: costPrice,
        selling_price: sellingPrice,
        minimum_stock: minimumStock,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4 py-8 overflow-y-auto">
      <Card className="w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">New product</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="SKU">
            <Input required value={sku} onChange={(e) => setSku(e.target.value)} />
          </Field>
          <Field label="Name">
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          {categories.length > 0 && (
            <Field label="Category">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Selling price">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />
          </Field>
          <Field label="Minimum stock (low-stock threshold)">
            <Input
              type="number"
              min={0}
              step="1"
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
            />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create product"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
