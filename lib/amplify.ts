/**
 * AWS Amplify v6 (browser) — Cognito email/password auth for the web.
 *
 * Mirrors finhome_app_native's amplify-config.ts but WITHOUT the OAuth /
 * social-login block: the /delete-account page only needs first-party
 * email + password sign-in to obtain a Cognito ID token for the delete call.
 *
 * Must run client-side only (Amplify touches window/localStorage).
 */
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";

let configured = false;

/** Configure Amplify once per browser session (idempotent). */
export function configureAmplifyWeb(): void {
  if (configured) return;

  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;

  if (!userPoolId || !userPoolClientId) {
    throw new Error(
      "Thiếu cấu hình Cognito (NEXT_PUBLIC_COGNITO_USER_POOL_ID / _CLIENT_ID).",
    );
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: { email: true },
        signUpVerificationMethod: "code",
        userAttributes: { email: { required: true } },
      },
    },
  });

  configured = true;
}

/** Current Cognito ID token, or null if there is no active session. */
export async function getCognitoIdToken(
  forceRefresh = false,
): Promise<string | null> {
  try {
    const session = await fetchAuthSession({ forceRefresh });
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}
