# Supabase password-recovery setup

The hidden website route is `https://footystatus.com/reset-password` (served by `reset-password/index.html`). It is intentionally absent from public navigation and marked `noindex`.

In Supabase Authentication URL Configuration, add this exact redirect URL:

`https://footystatus.com/reset-password`

Keep every existing callback and redirect URL. The app's `resetPasswordForEmail` call must use this URL as `redirectTo` in production.

The Reset Password email template must preserve Supabase's signed recovery URL. Use `{{ .ConfirmationURL }}` for the link target; do not replace it with a bare website URL. Supabase verifies the recovery token and then redirects to the allowlisted website route with the recovery session parameters.

The public Supabase client values in `js/supabase-client.js` are copied from the existing app client configuration. Do not instantiate another client in the reset page.
