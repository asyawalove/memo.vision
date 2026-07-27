"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { describeAuthError } from "@/lib/supabase/auth-errors";

type Status = "idle" | "sending" | "sent" | "error";

const RESEND_COOLDOWN_SECONDS = 45;

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.28A11.94 11.94 0 0 0 0 12c0 1.92.46 3.74 1.28 5.38l3.99-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.62l3.99 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(initialError ? "error" : "idle");
  const [message, setMessage] = useState<string | null>(initialError ?? null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function sendMagicLink(targetEmail: string) {
    setStatus("sending");
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setStatus("error");
        setMessage(describeAuthError(error));
        return;
      }

      setStatus("sent");
      setMessage("Письмо отправлено. Проверьте почту.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (thrown) {
      // TEMP DEBUG: the request itself threw (network/CORS/etc.) instead of
      // resolving with a Supabase error — without this the button was
      // getting stuck on "Отправка..." with no feedback at all.
      console.error("[auth] signInWithOtp threw:", thrown);
      setStatus("error");
      setMessage(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMagicLink(email);
  }

  async function handleResend() {
    if (cooldown > 0 || status === "sending") return;
    await sendMagicLink(email);
  }

  async function handleGoogleSignIn() {
    setStatus("sending");
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setStatus("error");
        setMessage(describeAuthError(error));
      }
    } catch (thrown) {
      console.error("[auth] signInWithOAuth threw:", thrown);
      setStatus("error");
      setMessage(null);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-3xl bg-card p-8 shadow-[0_1px_2px_rgba(38,36,31,0.06)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-orange text-lg font-bold">
        D.
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Вход</h1>
        <p className="text-sm text-muted-foreground">
          Введите email — мы отправим ссылку для входа без пароля.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background disabled:opacity-60"
        >
          {status === "sending" ? "Отправка..." : "Отправить ссылку"}
        </button>
      </form>

      {message && (
        <p
          role="status"
          className={
            status === "error"
              ? "rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700"
              : "rounded-2xl bg-accent-lime/40 px-4 py-3 text-sm text-foreground"
          }
        >
          {message}
        </p>
      )}

      {status === "sent" && (
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="w-full text-center text-sm font-medium text-foreground underline underline-offset-2 disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0
            ? `Не пришло письмо? Отправить ещё раз (${cooldown}с)`
            : "Не пришло письмо? Отправить ещё раз"}
        </button>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        или
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={status === "sending"}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-medium text-foreground disabled:opacity-60"
      >
        <GoogleIcon className="h-4 w-4" />
        Войти через Google
      </button>
    </div>
  );
}
