"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(initialError ? "error" : "idle");
  const [message, setMessage] = useState<string | null>(initialError ?? null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Ссылка для входа отправлена. Проверьте почту.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-6 rounded-3xl bg-card p-8 shadow-[0_1px_2px_rgba(38,36,31,0.06)]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-orange text-lg font-bold">
        m.
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Вход</h1>
        <p className="text-sm text-muted-foreground">
          Введите email — мы отправим ссылку для входа без пароля.
        </p>
      </div>

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
    </form>
  );
}
