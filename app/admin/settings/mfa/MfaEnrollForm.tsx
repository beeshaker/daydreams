"use client";

import { useActionState } from "react";
import { confirmMfaEnrollmentAction, type MfaEnrollState } from "./actions";

export function MfaEnrollForm({ secret }: { secret: string }) {
  const [state, formAction, pending] = useActionState(confirmMfaEnrollmentAction, {
    secret,
  } satisfies MfaEnrollState);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="secret" value={state.secret ?? secret} />
      <label className="flex flex-col gap-1 text-sm font-medium">
        6-digit code
        <input
          type="text"
          name="code"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          autoFocus
          className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-pink-strong px-5 py-2.5 font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Verifying…" : "Confirm and enable"}
      </button>
    </form>
  );
}
