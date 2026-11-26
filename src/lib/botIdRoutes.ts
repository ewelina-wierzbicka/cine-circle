// Client and server checkLevel must match. Browser POSTs only.
const advancedOptions = { checkLevel: 'basic' } as const;

export const BOTID_CHECK_OPTIONS = { advancedOptions };

export const BOTID_PROTECTED_ROUTES = [
  { path: '/login', method: 'POST', advancedOptions },
  { path: '/register', method: 'POST', advancedOptions },
  { path: '/forgot-password', method: 'POST', advancedOptions },
];
