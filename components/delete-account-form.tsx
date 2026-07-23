"use client";

import { useState } from "react";
import { signIn, signOut } from "aws-amplify/auth";
import { cn } from "@/lib/cn";
import { configureAmplifyWeb } from "@/lib/amplify";
import {
  deleteAccount,
  AccountDeletePartialFailure,
  AccountDeleteUnauthorized,
} from "@/lib/account-api";
import {
  DELETE_ACCOUNT_CONTENT as C,
  type AccountDeletionReason,
} from "@/content/delete-account";

type Step = "credentials" | "confirm" | "done";

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true; // fetch network failure
  const name = (err as { name?: string })?.name ?? "";
  return name === "NetworkError" || name.includes("Network");
}

function inputClasses(hasError: boolean): string {
  return cn(
    "w-full rounded-xl border bg-white px-4 py-2.5 text-base text-ink outline-none transition",
    "placeholder:text-ink-4 focus:ring-2 focus:ring-brand-green/30",
    hasError ? "border-red-400" : "border-ink-4/40 focus:border-brand-green",
  );
}

export function DeleteAccountForm() {
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState<AccountDeletionReason | "">("");
  const [feedback, setFeedback] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialFailure, setPartialFailure] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) return;
    setBusy(true);
    try {
      configureAmplifyWeb();
      // Clear any stale session so signIn doesn't throw "already authenticated".
      await signOut().catch(() => {});
      const { isSignedIn, nextStep } = await signIn({
        username: email.trim(),
        password,
      });
      if (isSignedIn) {
        setPassword("");
        setStep("confirm");
        return;
      }
      // Any other next step (unconfirmed account, forced reset, etc.)
      if (nextStep?.signInStep === "CONFIRM_SIGN_UP") {
        setError(C.messages.needsConfirmation);
      } else {
        setError(C.messages.needsConfirmation);
      }
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        setError(C.messages.network);
      } else {
        const name = (err as { name?: string })?.name ?? "";
        if (name === "UserNotConfirmedException") {
          setError(C.messages.needsConfirmation);
        } else {
          setError(C.messages.invalidCredentials);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setPartialFailure(false);
    if (!confirmed) {
      setError(C.messages.mustConfirm);
      return;
    }
    setBusy(true);
    try {
      await deleteAccount({
        reason: reason || undefined,
        feedback: feedback.trim() || undefined,
      });
      await signOut().catch(() => {});
      setStep("done");
    } catch (err: unknown) {
      if (err instanceof AccountDeletePartialFailure) {
        setPartialFailure(true);
        setError(C.messages.partialFailure);
      } else if (err instanceof AccountDeleteUnauthorized) {
        // Session expired — send the user back to re-authenticate.
        setStep("credentials");
        setError(C.messages.invalidCredentials);
      } else if (isNetworkError(err)) {
        setError(C.messages.network);
      } else {
        setError(C.messages.genericError);
      }
    } finally {
      setBusy(false);
    }
  }

  if (step === "done") {
    return (
      <div className="rounded-3xl border border-brand-green/30 bg-bg-soft p-6 md:p-8">
        <h3 className="font-display text-lg font-medium text-ink md:text-xl">
          {C.messages.successTitle}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-ink-2">
          {C.messages.successBody}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-ink-4/15 bg-white p-6 shadow-sm md:p-8">
      {step === "credentials" ? (
        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label
              htmlFor="da-email"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              {C.form.emailLabel}
            </label>
            <input
              id="da-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={C.form.emailPlaceholder}
              className={inputClasses(false)}
            />
          </div>
          <div>
            <label
              htmlFor="da-password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              {C.form.passwordLabel}
            </label>
            <input
              id="da-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={C.form.passwordPlaceholder}
              className={inputClasses(false)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm leading-relaxed text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-full px-5 py-3 font-display font-medium text-white transition",
              "bg-brand-green hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {busy ? C.form.signingInLabel : C.form.continueLabel}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-ink-2">
            {C.messages.signedInAs}{" "}
            <span className="font-medium text-ink">{email}</span>
          </p>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">
              {C.form.reasonLabel}
            </legend>
            <div className="space-y-2">
              {C.reasons.map((r) => (
                <label
                  key={r.value}
                  className="flex cursor-pointer items-center gap-2.5 text-base text-ink-2"
                >
                  <input
                    type="radio"
                    name="da-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="h-4 w-4 accent-brand-green"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="da-feedback"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              {C.form.feedbackLabel}
            </label>
            <textarea
              id="da-feedback"
              rows={3}
              maxLength={C.form.feedbackMaxLength}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={C.form.feedbackPlaceholder}
              className={cn(inputClasses(false), "resize-none")}
            />
            <p className="mt-1 text-right text-xs text-ink-4">
              {feedback.length}/{C.form.feedbackMaxLength}
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-ink-2">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
            />
            {C.form.confirmCheckbox}
          </label>

          {error ? (
            <div role="alert" className="text-sm leading-relaxed text-red-600">
              <p>{error}</p>
              {partialFailure ? (
                <a
                  href={`mailto:${C.supportEmail}`}
                  className="mt-1 inline-block font-medium underline"
                >
                  {C.supportEmail}
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy || !confirmed}
              className={cn(
                "inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 font-display font-medium text-white transition",
                "bg-red-600 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {busy ? C.form.deletingLabel : C.form.deleteLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setError(null);
                setConfirmed(false);
              }}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-full border border-ink-4/40 px-5 py-3 font-display font-medium text-ink transition hover:bg-ink/5 disabled:opacity-60"
            >
              {C.form.backLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
