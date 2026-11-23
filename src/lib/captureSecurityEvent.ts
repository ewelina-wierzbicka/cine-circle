import * as Sentry from '@sentry/nextjs';

export type SecurityEvent =
  | 'cron.keep_alive_unauthorized'
  | 'email.inbound_missing_secret'
  | 'email.inbound_missing_signature_headers'
  | 'email.inbound_timestamp_out_of_range'
  | 'email.inbound_invalid_signature'
  | 'auth.oauth_callback_missing_code'
  | 'auth.oauth_callback_exchange_failed'
  | 'auth.confirm_callback_missing_code'
  | 'auth.reset_callback_missing_code'
  | 'auth.reset_callback_exchange_failed';

// Name only. Never pass a body, a token, an email or a user id.
export function captureSecurityEvent(event: SecurityEvent): void {
  Sentry.captureMessage(event, {
    level: 'warning',
    tags: { security: true, security_event: event },
  });
}
