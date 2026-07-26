import type { AuthError } from "@supabase/supabase-js";

const RATE_LIMIT_CODES = new Set([
  "over_email_send_rate_limit",
  "over_request_rate_limit",
  "over_sms_send_rate_limit",
]);

const INVALID_EMAIL_CODES = new Set(["email_address_invalid", "validation_failed"]);

export function describeAuthError(error: AuthError): string {
  const code = error.code ?? "";

  if (RATE_LIMIT_CODES.has(code) || /rate limit/i.test(error.message)) {
    return "Слишком много попыток. Подождите пару минут и попробуйте снова.";
  }

  if (INVALID_EMAIL_CODES.has(code)) {
    return "Проверьте правильность email.";
  }

  return "Что-то пошло не так, попробуйте ещё раз.";
}
