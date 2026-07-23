/**
 * Account-deletion API client for the web — wraps `POST /me/account/delete`.
 *
 * Mirrors finhome_app_native/features/profile/services/account-api.ts: the BE
 * cascades RDS deletion, anonymizes loan leads (SBV 5-year retention), then
 * removes the Cognito identity. HTTP 500 means RDS was deleted but the Cognito
 * removal failed (orphaned identity) — surface a support CTA.
 *
 * Auth model matches the mobile api-client: both the static gateway key
 * (`x-api-key`) and the user's Cognito ID token (`Authorization: Bearer …`).
 */
import { getCognitoIdToken } from "@/lib/amplify";
import type { AccountDeletionReason } from "@/content/delete-account";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const DELETE_ENDPOINT = "/me/account/delete";

/** RDS cleanup succeeded but Cognito identity removal failed. */
export class AccountDeletePartialFailure extends Error {
  constructor() {
    super("account_delete_partial_failure");
    this.name = "AccountDeletePartialFailure";
  }
}

/** Session/token missing or rejected — caller should re-authenticate. */
export class AccountDeleteUnauthorized extends Error {
  constructor() {
    super("account_delete_unauthorized");
    this.name = "AccountDeleteUnauthorized";
  }
}

export interface DeleteAccountPayload {
  reason?: AccountDeletionReason;
  feedback?: string;
}

/**
 * Delete the signed-in user's account via the backend.
 * Resolves on success; throws AccountDeleteUnauthorized (401/403),
 * AccountDeletePartialFailure (500), or a generic Error otherwise.
 */
export async function deleteAccount(
  payload: DeleteAccountPayload = {},
): Promise<void> {
  if (!API_URL || !API_TOKEN) {
    throw new Error("Thiếu cấu hình API (NEXT_PUBLIC_API_URL / _API_TOKEN).");
  }

  const idToken = await getCognitoIdToken();
  if (!idToken) throw new AccountDeleteUnauthorized();

  const body: Record<string, string> = {};
  if (payload.reason) body.reason = payload.reason;
  if (payload.feedback) body.feedback = payload.feedback;

  const res = await fetch(`${API_URL}${DELETE_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_TOKEN,
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });

  if (res.ok) return;
  if (res.status === 401 || res.status === 403) {
    throw new AccountDeleteUnauthorized();
  }
  if (res.status === 500) throw new AccountDeletePartialFailure();
  throw new Error(`account_delete_failed_${res.status}`);
}
