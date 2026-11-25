// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { initBotId } from 'botid/client/core';

import { SENTRY_DSN } from '@/lib/sentryDsn';
import { BOTID_PROTECTED_ROUTES } from '@/lib/botIdRoutes';

Sentry.init({
  dsn: SENTRY_DSN,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    userInfo: false,
    httpBodies: [],
  },
});

// Patches `fetch` and `XMLHttpRequest`, so the challenge script is fetched on
// the first matching request, not on every page load. No-op in development.
initBotId({ protect: BOTID_PROTECTED_ROUTES });

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
