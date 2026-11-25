// The one source for both sides of BotID. `checkLevel` must be identical on the
// client and the server or verification always fails.
//
// POST only, and only paths a browser running the client SDK posts to. A webhook,
// a cron path, a page GET or a metadata route carries no challenge header, so
// listing one would make every real request look like a bot.
const advancedOptions = { checkLevel: 'basic' } as const;

export const BOTID_CHECK_OPTIONS = { advancedOptions };

export const BOTID_PROTECTED_ROUTES = [
  { path: '/login', method: 'POST', advancedOptions },
  { path: '/register', method: 'POST', advancedOptions },
  { path: '/forgot-password', method: 'POST', advancedOptions },
];
