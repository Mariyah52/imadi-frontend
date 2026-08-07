import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { categorizeExpense } from "../../api/ai";
import type { CategorizeExpenseResponse } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";

export function ExpenseCategorizerPage() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<CategorizeExpenseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await categorizeExpense(description.trim());
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't categorize this.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link to="/ai" className="text-sm text-navy-800 hover:underline">
        ← AI tools
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Expense categorizer</h1>

      <Card className="p-5 max-w-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="e.g. Uber to client meeting"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "…" : "Categorize"}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-negative">{error}</p>}
        {result && (
          <div className="mt-4 rounded-md bg-navy-50 p-4">
            <div className="text-sm text-ink-muted">Suggested category</div>
            <div className="font-display text-lg font-semibold text-ink capitalize">
              {result.suggested_category}
            </div>
            <div className="text-xs text-ink-muted mt-1">
              {result.confidence_percent}% confidence
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
