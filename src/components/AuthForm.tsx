import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import styles from "./AuthForm.module.css";

type Mode = "signIn" | "signUp";

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    const { data, error: authError } =
      mode === "signIn"
        ? await signIn({ email: trimmedEmail, password })
        : await signUp({ email: trimmedEmail, password });
    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }
    if (mode === "signUp" && !data.session) {
      setCheckEmail(trimmedEmail);
    }
  }

  if (checkEmail) {
    return (
      <p className={styles.notice}>
        Check your inbox at {checkEmail} for a confirmation link, then sign
        in.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="submit" disabled={submitting}>
          {mode === "signIn" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
        >
          {mode === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </form>
  );
}
