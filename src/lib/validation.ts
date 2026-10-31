/** Shared `react-hook-form` rules, so every auth form rejects the same input. */

export const EMAIL_RULES = {
  required: 'Please enter your email address',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
};

/**
 * Takes the `required` message because "Please enter a password" (register)
 * and "Please enter a new password" (reset) differ.
 */
export const passwordRules = (required: string) => ({
  required,
  minLength: {
    value: 8,
    message: 'Password must be at least 8 characters',
  },
  pattern: {
    value:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  },
});
