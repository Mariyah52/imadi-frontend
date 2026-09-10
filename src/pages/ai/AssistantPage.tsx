import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { askAssistant } from "../../api/ai";
import type { AssistantResponse } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";

interface Exchange {
  question: string;
  response: AssistantResponse;
}

export function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await askAssistant(q);
      setHistory((prev) => [...prev, { question: q, response: res }]);
      setQuestion("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't get an answer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link to="/ai" className="text-sm text-navy-800 hover:underline">
        ← AI tools
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-1">Financial assistant</h1>
      <p className="text-sm text-ink-muted mb-6">
        Ask a question about your business data — this queries the backend's assistant service
        directly, not a general-purpose chat model.
      </p>

      <div className="flex flex-col gap-4 mb-6">
        {history.map((ex, i) => (
          <Card key={i} className="p-5">
            <p className="text-sm font-medium text-ink mb-2">{ex.question}</p>
            <p className="text-sm text-ink-muted whitespace-pre-wrap">{ex.response.answer}</p>
            <span className="mt-2 inline-block rounded-full bg-navy-100 px-2 py-0.5 text-xs text-ink-muted capitalize">
              {ex.response.intent.replace("_", " ")}
            </span>
          </Card>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-negative">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg">
        <Input
          placeholder="e.g. What's my outstanding AR?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Asking…" : "Ask"}
        </Button>
      </form>
    </div>
  );
}
