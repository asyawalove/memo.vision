import type { AuthError } from "@supabase/supabase-js";

const RATE_LIMIT_CODES = new Set([
  "over_email_send_rate_limit",
  "over_request_rate_limit",
  "over_sms_send_rate_limit",
]);

const INVALID_EMAIL_CODES = new Set(["email_address_invalid", "validation_failed"]);

export function describeAuthError(error: AuthError): string | null {
  const code = error.code ?? "";

  if (RATE_LIMIT_CODES.has(code) || /rate limit/i.test(error.message)) {
    return "Слишком много попыток. Подождите пару минут и попробуйте снова.";
  }

  if (INVALID_EMAIL_CODES.has(code)) {
    return "Проверьте правильность email.";
  }

  // TEMP DEBUG: catch-all message disabled so we can see the real Supabase
  // error for the "email send fails" report. Remove this console.error and
  // restore the generic message once the root cause is identified.
  console.error("[auth] unrecognized Supabase error:", {
    message: error.message,
    code: error.code,
    status: error.status,
    name: error.name,
  });
  return null;
}
