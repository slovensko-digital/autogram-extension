import { css } from "lit";

/**
 * Design tokens shared by the injected dialog and the extension options page
 * (`options.html` and `popup.html` in autogram-extension repeat them, a test keeps
 * the two in sync).
 *
 * The look follows sluzby.slovensko.digital/autogram-v-mobile (the app's
 * blue, Tailwind grays, system font) and deliberately avoids ID-SK/GOV.UK
 * styling, so the dialog is never mistaken for part of the government site
 * it opens on.
 */
export const themeTokens = css`
  :host {
    --ag-font:
      ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    --ag-text: #111827;
    --ag-text-muted: #4b5563;
    --ag-text-subtle: #6b7280;
    --ag-border: #e5e7eb;
    --ag-ring: #d1d5db;
    --ag-surface: #ffffff;
    --ag-surface-muted: #f9fafb;
    --ag-surface-hover: #f3f4f6;
    --ag-primary: #0055d0;
    --ag-primary-hover: #0044a8;
    --ag-primary-soft: #eef4ff;
    --ag-link: #0055d0;
    --ag-link-hover: #0044a8;
    --ag-focus: #0055d0;
    --ag-success: #15803d;
    --ag-danger: #dc2626;
    --ag-danger-soft: #fef2f2;
    --ag-warning: #b45309;
    --ag-warning-soft: #fffbeb;
    --ag-radius: 6px;
    --ag-radius-lg: 12px;
  }
`;
