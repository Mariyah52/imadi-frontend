import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, isTwoFactorRequired, login, loginTwoFactor } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { Card } from "../components/ui/Card";
import { LOGO_DATA_URI } from "../assets/logo";

export function LoginPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (isTwoFactorRequired(result)) {
        setTwoFactorToken(result.two_factor_token);
      } else {
        const withRefresh = result as typeof result & { refresh_token?: string };
        setSession(
          result.access_token,
          {
            id: result.user_id,
            email: result.email,
            full_name: result.full_name,
            permissions: result.permissions,
            mfa_enabled: false,
          },
          withRefresh.refresh_token,
        );
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTwoFactorSubmit(e: FormEvent) {
    e.preventDefault();
    if (!twoFactorToken) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await loginTwoFactor(twoFactorToken, totpCode);
      const withRefresh = result as typeof result & { refresh_token?: string };
      // Set the token first so the authenticated /auth/me call below can
      // use it, then hydrate the full user record from that endpoint.
      setSession(
        result.access_token,
        {
          id: result.user_id,
          email: result.email,
          full_name: result.full_name,
          permissions: result.permissions,
          mfa_enabled: true,
        },
        withRefresh.refresh_token,
      );
      const me = await getMe();
      setSession(result.access_token, me);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code. Try again.");
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
          {twoFactorToken === null ? (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <h1 className="font-display text-lg font-semibold text-ink mb-1">Sign in</h1>
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
                <Input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {error && <p className="text-sm text-negative">{error}</p>}
              <Button type="submit" disabled={submitting} className="mt-2 w-full">
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleTwoFactorSubmit} className="flex flex-col gap-4">
              <h1 className="font-display text-lg font-semibold text-ink mb-1">
                Enter your 2FA code
              </h1>
              <p className="text-sm text-ink-muted -mt-2">
                Open your authenticator app and enter the 6-digit code.
              </p>
              <Field label="Authentication code">
                <Input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="font-mono-data tracking-widest text-center text-lg"
                />
              </Field>
              {error && <p className="text-sm text-negative">{error}</p>}
              <Button type="submit" disabled={submitting} className="mt-2 w-full">
                {submitting ? "Verifying…" : "Verify"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
