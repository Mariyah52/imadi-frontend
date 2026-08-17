import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerOwner } from "../api/auth";
import { ApiError } from "../api/client";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { Card } from "../components/ui/Card";
import { LOGO_DATA_URI } from "../assets/logo";

export function SignupPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerOwner(email, password, firstName, lastName);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center">
          <img src={LOGO_DATA_URI} alt="IMADI Fulfilment & Logistics" className="h-12" />
        </div>

        <Card className="p-8">
          {success ? (
            <div className="flex flex-col gap-4">
              <h1 className="font-display text-lg font-semibold text-ink mb-1">Account created</h1>
              <p className="text-sm text-ink-muted">
                Your owner account is ready. You can now sign in.
              </p>
              <Button onClick={() => navigate("/login", { replace: true })} className="mt-2 w-full">
                Go to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h1 className="font-display text-lg font-semibold text-ink mb-1">
                Create owner account
              </h1>
              <p className="text-sm text-ink-muted -mt-2">
                This only works once — to set up the very first account. If an account already
                exists, this will be refused.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name">
                  <Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </Field>
                <Field label="Last name">
                  <Input required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </Field>
              </div>
              <Field label="Email">
                <Input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </Field>
              {error && <p className="text-sm text-negative">{error}</p>}
              <Button type="submit" disabled={submitting} className="mt-2 w-full">
                {submitting ? "Creating…" : "Create account"}
              </Button>
              <Link to="/login" className="text-center text-sm text-navy-800 hover:underline">
                Already have an account? Sign in
              </Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
