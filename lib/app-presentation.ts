/**
 * Runs before page content is parsed when a calculator is hosted by the FinHome app.
 * The website owns this presentation contract: hide duplicate site chrome, scale type with
 * iOS Dynamic Type, and keep that contract for the rest of the in-app session.
 *
 * - SCOPED to `/cong-cu/*`. `?app=1` anywhere else is ignored, so a shared link cannot strip
 *   the header/footer (company details, privacy, terms) from ordinary pages.
 * - PERSISTED in sessionStorage for the tab, not re-derived from the query string: Next `<Link>`
 *   navigates client-side with its own href, and a later full load would otherwise drop back to
 *   the full site chrome inside the app.
 * - PARAMS REMOVED from the address once read (`history.replaceState`), so analytics and
 *   anything the reader shares never carry the reader's text-size setting.
 * - ANALYTICS OFF in app mode (`window.__FINHOME_APP__`, read by components/google-analytics).
 * - SCALE up to 3.2 (iOS AX5 ≈ 3.1): results scale the whole way; only display headings are
 *   bounded, in CSS (app/globals.css).
 */
export const APP_MODE_STORAGE_KEY = "finhome-app-presentation";
export const APP_MAX_TEXT_SCALE = 3.2;

export const APP_PRESENTATION_BOOTSTRAP = `
  (function () {
    try {
      var loc = window.location;
      if (!/^\\/cong-cu(?:\\/|$)/.test(loc.pathname)) return;
      var store = null;
      try { store = window.sessionStorage; } catch (_) {}

      var params = new URLSearchParams(loc.search);
      var scale = null;
      if (params.get('app') === '1') {
        var raw = Number(params.get('textScale'));
        scale = Number.isFinite(raw) ? Math.min(${APP_MAX_TEXT_SCALE}, Math.max(1, raw)) : 1;
        try { if (store) store.setItem('${APP_MODE_STORAGE_KEY}', String(scale)); } catch (_) {}
        params.delete('app');
        params.delete('textScale');
        var rest = params.toString();
        try {
          window.history.replaceState(window.history.state, '', loc.pathname + (rest ? '?' + rest : '') + loc.hash);
        } catch (_) {}
      } else if (store) {
        var saved = Number(store.getItem('${APP_MODE_STORAGE_KEY}'));
        if (Number.isFinite(saved) && saved >= 1) scale = Math.min(${APP_MAX_TEXT_SCALE}, saved);
      }
      if (scale == null) return;

      window.__FINHOME_APP__ = true;
      var root = document.documentElement;
      root.setAttribute('data-finhome-app', 'true');
      root.style.setProperty('--fh-app-root-font-size', String(Math.round(scale * 100)) + '%');
    } catch (_) {}
  })();
`;
