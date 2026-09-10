import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { importStatement } from "../../api/banking";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { Textarea } from "../../components/ui/Textarea";

export function ImportStatementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("statement.csv");
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [csvContent, setCsvContent] = useState("date,description,amount,reference\n");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await importStatement({
        bank_account_id: id,
        file_name: fileName,
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        csv_content: csvContent,
      });
      navigate(`/banking/statement-imports/${result.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't import the statement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link to={`/banking/accounts/${id}`} className="text-sm text-navy-800 hover:underline">
        ← Account
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-1">Import statement</h1>
      <p className="text-sm text-ink-muted mb-6">
        Paste raw CSV with a header row: <code className="font-mono-data">date,description,amount,reference</code>
      </p>

      <Card className="p-5 max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="File name">
            <Input required value={fileName} onChange={(e) => setFileName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Opening balance">
              <Input
                type="number"
                step="0.01"
                required
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
              />
            </Field>
            <Field label="Closing balance">
              <Input
                type="number"
                step="0.01"
                required
                value={closingBalance}
                onChange={(e) => setClosingBalance(e.target.value)}
              />
            </Field>
          </div>
          <Field label="CSV content">
            <Textarea
              rows={10}
              required
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="font-mono-data"
            />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Importing…" : "Import statement"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
