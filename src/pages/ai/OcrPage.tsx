import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getOcrDocument, listOcrDocuments, ocrInvoice, ocrReceipt } from "../../api/ai";
import type { OcrDocument, OcrDocumentSummary } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export function OcrPage() {
  const [documents, setDocuments] = useState<OcrDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"invoice" | "receipt" | null>(null);
  const [selected, setSelected] = useState<OcrDocument | null>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    listOcrDocuments(undefined, 1, 50)
      .then((res) => setDocuments(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load documents."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleUpload(kind: "invoice" | "receipt", file: File) {
    setUploading(kind);
    setError(null);
    try {
      const doc = kind === "invoice" ? await ocrInvoice(file) : await ocrReceipt(file);
      setSelected(doc);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  function handleSelect(id: string) {
    getOcrDocument(id)
      .then(setSelected)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this document."));
  }

  return (
    <div>
      <Link to="/ai" className="text-sm text-navy-800 hover:underline">
        ← AI tools
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Document scanning (OCR)</h1>

      <div className="mb-6 flex gap-3">
        <input
          ref={invoiceInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload("invoice", e.target.files[0])}
        />
        <input
          ref={receiptInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload("receipt", e.target.files[0])}
        />
        <Button disabled={uploading !== null} onClick={() => invoiceInputRef.current?.click()}>
          {uploading === "invoice" ? "Scanning…" : "Scan invoice"}
        </Button>
        <Button
          variant="secondary"
          disabled={uploading !== null}
          onClick={() => receiptInputRef.current?.click()}
        >
          {uploading === "receipt" ? "Scanning…" : "Scan receipt"}
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-negative">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Recent documents</h2>
          {loading ? (
            <p className="px-5 pb-5 text-sm text-ink-muted">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-ink-muted">No documents scanned yet.</p>
          ) : (
            <ul className="px-5 pb-5 flex flex-col gap-2">
              {documents.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => handleSelect(d.id)}
                    className="w-full text-left text-sm rounded-md px-2 py-1.5 hover:bg-navy-50"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{d.document_type}</span>
                      <span className="text-xs text-ink-muted">{d.confidence_score}%</span>
                    </div>
                    <div className="text-xs text-ink-muted">{d.file_name}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-medium text-ink-muted mb-3">Extracted data</h2>
          {!selected ? (
            <p className="text-sm text-ink-muted">Select a document to view its extracted fields.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-ink-muted">
                {selected.file_name} · {selected.status} · {selected.confidence_score}% confidence
              </div>
              <pre className="text-xs bg-navy-50 rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selected.extracted_data, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
