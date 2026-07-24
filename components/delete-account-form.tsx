"use client";

import { useState } from "react";
import { signIn, signOut, deleteUser } from "aws-amplify/auth";
import { cn } from "@/lib/cn";
import { configureAmplifyWeb, getCognitoIdToken } from "@/lib/amplify";
import { deleteAccountData, AccountDataUnauthorized } from "@/lib/account-api";
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

function inputClasses(): string {
  return cn(
    "w-full rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 text-base text-ink outline-none transition",
    "placeholder:text-ink-4 focus:border-brand-green focus:ring-2 focus:ring-brand-green/30",
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
  const [showSupport, setShowSupport] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) return;
    setBusy(true);
    try {
      configureAmplifyWeb();
      // Clear any stale session so signIn doesn't throw "already authenticated".
      await signOut().catch(() => {});
      const { isSignedIn } = await signIn({
        username: email.trim(),
        password,
      });
      if (isSignedIn) {
        setPassword("");
        setStep("confirm");
      } else {
        setError(C.messages.needsConfirmation);
      }
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        setError(C.messages.network);
      } else {
        const name = (err as { name?: string })?.name ?? "";
        setError(
          name === "UserNotConfirmedException"
            ? C.messages.needsConfirmation
            : C.messages.invalidCredentials,
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setShowSupport(false);
    if (!confirmed) {
      setError(C.messages.mustConfirm);
      return;
    }
    setBusy(true);

    // Capture the ID token BEFORE deleting the Cognito user (Amplify clears the
    // local session on deleteUser; the captured JWT stays valid by expiry).
    const idToken = await getCognitoIdToken();
    if (!idToken) {
      setBusy(false);
      setError(C.messages.invalidCredentials);
      setStep("credentials");
      return;
    }

    // Step 1: delete the Cognito identity (client → public Cognito). If this
    // fails, we abort BEFORE touching any data — nothing to roll back.
    try {
      await deleteUser();
    } catch (err: unknown) {
      setBusy(false);
      setError(isNetworkError(err) ? C.messages.network : C.messages.cognitoFailed);
      setShowSupport(true);
      return;
    }

    // Step 2: backend cascade-deletes RDS data (idempotent → retry once).
    let dataOk = false;
    for (let attempt = 0; attempt < 2 && !dataOk; attempt++) {
      try {
        await deleteAccountData(idToken, {
          reason: reason || undefined,
          feedback: feedback.trim() || undefined,
        });
        dataOk = true;
      } catch (err: unknown) {
        if (err instanceof AccountDataUnauthorized || attempt === 1) break;
      }
    }

    await signOut().catch(() => {});
    setBusy(false);

    if (dataOk) {
      setStep("done");
    } else {
      // Login already removed; data cleanup pending (ops can complete it).
      setStep("done");
      setError(C.messages.dataPending);
      setShowSupport(true);
    }
  }

  if (step === "done") {
    return (
      <div className="rounded-3xl border border-brand-green/30 bg-bg-soft p-6 md:p-8">
        <h3 className="font-display text-lg font-medium text-ink md:text-xl">
          {C.messages.successTitle}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-ink-2">
          {error ?? C.messages.successBody}
        </p>
        {showSupport ? (
          <a
            href={`mailto:${C.supportEmail}`}
            className="mt-2 inline-block font-medium text-brand-green underline"
          >
            {C.supportEmail}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-ink-4/15 bg-white p-6 shadow-sm md:p-8">
      {step === "credentials" ? (
        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label htmlFor="da-email" className="mb-1.5 block text-sm font-medium text-ink">
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
              className={inputClasses()}
            />
          </div>
          <div>
            <label htmlFor="da-password" className="mb-1.5 block text-sm font-medium text-ink">
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
              className={inputClasses()}
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
              "inline-flex w-full items-center justify-center rounded-full bg-brand-green px-5 py-3 font-display font-medium text-white transition",
              "hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60",
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
            <label htmlFor="da-feedback" className="mb-1.5 block text-sm font-medium text-ink">
              {C.form.feedbackLabel}
            </label>
            <textarea
              id="da-feedback"
              rows={3}
              maxLength={C.form.feedbackMaxLength}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={C.form.feedbackPlaceholder}
              className={cn(inputClasses(), "resize-none")}
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
              {showSupport ? (
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
                "inline-flex flex-1 items-center justify-center rounded-full bg-red-600 px-5 py-3 font-display font-medium text-white transition",
                "hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60",
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
