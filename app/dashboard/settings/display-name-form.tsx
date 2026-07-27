"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateDisplayName } from "./actions";

type Status = "idle" | "saved" | "error";

export function DisplayNameForm({ initialDisplayName }: { initialDisplayName: string }) {
  const [value, setValue] = useState(initialDisplayName);
  const [status, setStatus] = useState<Status>("idle");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    startTransition(async () => {
      const result = await updateDisplayName(value);
      setStatus(result?.error ? "error" : "saved");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="display_name" className="text-sm font-medium">
        Как к вам обращаться
      </label>
      <p className="text-xs text-muted-foreground">
        Это имя мы будем использовать в приветствии в личном кабинете.
      </p>
      <div className="flex gap-2">
        <input
          id="display_name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Например, Аня"
          maxLength={60}
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-60"
        >
          {isPending ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
      {status === "saved" && (
        <p className="text-xs text-muted-foreground">Сохранено</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-600">Не удалось сохранить, попробуйте ещё раз</p>
      )}
    </form>
  );
}
