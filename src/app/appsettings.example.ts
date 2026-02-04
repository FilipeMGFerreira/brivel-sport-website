/**
 * Application Settings Example
 * 
 * Copy this file to appsettings.ts and fill in your actual values.
 * The appsettings.ts file is gitignored and will not be committed.
 */

export const appSettings = {
  instagram: {
    appId: 'YOUR_INSTAGRAM_APP_ID',
    accessToken: 'YOUR_INSTAGRAM_ACCESS_TOKEN',
    userId: 'YOUR_INSTAGRAM_USER_ID'
  },
  formspree: {
    formId: 'YOUR_FORMSPREE_FORM_ID'
  },
  googleAnalytics: {
    measurementId: 'YOUR_GA4_MEASUREMENT_ID'
  },
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  },
  turnstile: {
    siteKey: 'YOUR_TURNSTILE_SITE_KEY'
  }
};
