/**
 * Backend account-data deletion client — wraps `POST /me/account/delete`.
 *
 * The backend endpoint deletes account data and processes legally required retention; the
 * Cognito identity is removed by the client (see delete-account-form). This is
 * called AFTER the client has deleted its Cognito identity, using the ID token
 * captured beforehand (still valid by JWT expiry even though the user is gone).
 */
import type { AccountDeletionReason } from "@/content/delete-account";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const DELETE_ENDPOINT = "/me/account/delete";

/** Auth token missing or rejected by the backend. */
export class AccountDataUnauthorized extends Error {
  constructor() {
    super("account_data_unauthorized");
    this.name = "AccountDataUnauthorized";
  }
}

export interface DeleteAccountPayload {
  reason?: AccountDeletionReason;
  feedback?: string;
}

/**
 * Ask the backend to cascade-delete the user's RDS data.
 * `idToken` must be captured BEFORE the client deletes its Cognito identity.
 * Resolves on success; throws AccountDataUnauthorized (401/403) or a generic
 * Error otherwise. Safe to retry (backend is idempotent).
 */
export async function deleteAccountData(
  idToken: string,
  payload: DeleteAccountPayload = {},
): Promise<void> {
  if (!API_URL || !API_TOKEN) {
    throw new Error("Thiếu cấu hình API (NEXT_PUBLIC_API_URL / _API_TOKEN).");
  }

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
    throw new AccountDataUnauthorized();
  }
  throw new Error(`account_data_delete_failed_${res.status}`);
}
