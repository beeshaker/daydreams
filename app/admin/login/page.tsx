"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const needsTotp = Boolean(state.pendingUsername);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-6 text-brand-ink">
      <form action={formAction} className="w-full max-w-sm rounded-lg bg-white p-8 shadow ring-1 ring-brand-ink/10">
        <h1 className="text-xl font-bold">Admin sign in</h1>

        <label className="mt-6 flex flex-col gap-1 text-sm font-medium">
          Username
          <input
            type="text"
            name="username"
            required
            autoComplete="username"
            defaultValue={state.pendingUsername ?? ""}
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base"
          />
        </label>

        <label className="mt-4 flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base"
          />
        </label>

        {needsTotp && (
          <>
            <p className="mt-4 text-sm text-brand-ink/70">
              Enter the 6-digit code from your authenticator app, along with your password again.
            </p>
            <label className="mt-2 flex flex-col gap-1 text-sm font-medium">
              Authentication code
              <input
                type="text"
                name="totpCode"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                required
                className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base"
              />
            </label>
          </>
        )}

        {state.error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-md bg-brand-pink-strong px-5 py-2.5 font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Signing in…" : needsTotp ? "Verify" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
