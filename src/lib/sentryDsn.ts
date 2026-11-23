export const SENTRY_DSN =
  'https://8e42c9d3b534149a525215f387ba65f6@o4512091748106240.ingest.de.sentry.io/4512112781819984';

// https://<ingest host>/api/<project id>/security/?sentry_key=<public key>
function cspReportUrl(dsn: string): string {
  const { host, username, pathname } = new URL(dsn);
  return `https://${host}/api/${pathname.replace(/^\//, '')}/security/?sentry_key=${username}`;
}

export const SENTRY_CSP_REPORT_URL = cspReportUrl(SENTRY_DSN);
