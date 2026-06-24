import i18n, { type InitOptions } from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import HttpBackend, { type HttpBackendOptions } from "i18next-http-backend"

// ── English translations bundled directly into the app (src/i18n/locales/en/)
// These act as the offline-safe fallback. They are NEVER fetched over HTTP.
// All other languages (hi, etc.) live in public/locales/ and are lazy-loaded
// on demand via HttpBackend when the user switches language.
import enCommon from "./locales/en/common.json"
import enNav from "./locales/en/nav.json"
import enHome from "./locales/en/home.json"
import enEventDetail from "./locales/en/eventDetail.json"
import enCreateEvent from "./locales/en/createEvent.json"
import enAuth from "./locales/en/auth.json"

// ── Namespace registry ────────────────────────────────────────────────────────
// Type the namespace names so useTranslation('nav') is type-safe.
export const NAMESPACES = ["common", "nav", "home", "eventDetail", "createEvent", "auth"] as const
export type Namespace = (typeof NAMESPACES)[number]


// ── initI18n ─────────────────────────────────────────────────────────────────
// Called once in main.tsx before ReactDOM.render().
// English is always available immediately (bundled). Other languages are
// fetched from /public/locales/{lng}/{ns}.json only when needed.
export async function initI18n(): Promise<void> {
  // Determine which language to preload. We read the same localStorage key
  // that LanguageDetector would write, falling back to "en".
  const storedLang = localStorage.getItem("nextevent_lang") ?? "en"
  const preloadLang = ["en", "hi"].includes(storedLang) ? storedLang : "en"

  // Explicit type annotation resolves Vite's stricter generic overload check for
  // i18n.init() when HttpBackend is registered via .use().
  const options: InitOptions<HttpBackendOptions> = {
    // ── Backend: lazy-load non-English translation files from /public/locales/
    // Vite copies everything in /public to the build root,
    // so this URL resolves correctly in both dev and production.
    // English ("en") is skipped entirely by HttpBackend because its resources
    // are already provided below via `resources`.
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    // Supported languages
    supportedLngs: ["en", "hi"],

    // Fall back to English if a key is missing in the active language.
    fallbackLng: "en",

    // The default namespace used when useTranslation() is called without an arg.
    // e.g. const { t } = useTranslation() → reads from 'common'
    defaultNS: "common",

    // All registered namespaces — i18next uses this list to validate calls.
    ns: NAMESPACES,

    // Preload the detected language so layout components always get real
    // strings on the very first render. English is already bundled so
    // preloading "en" is a no-op network-wise.
    preload: [preloadLang],

    // Allows mixing eagerly bundled English and HTTP-fetched other languages.
    partialBundledLanguages: true,

    // English translations bundled at build time — zero network requests needed.
    // Other languages will be fetched by HttpBackend on demand.
    resources: {
      en: {
        common: enCommon,
        nav: enNav,
        home: enHome,
        eventDetail: enEventDetail,
        createEvent: enCreateEvent,
        auth: enAuth,
      },
    },

    interpolation: {
      // React already escapes output — disable double-escaping.
      escapeValue: false,
    },

    detection: {
      // Priority order for language detection
      order: ["localStorage", "navigator"],
      // Persist the user's choice to localStorage so it survives page refresh.
      caches: ["localStorage"],
      // The localStorage key used to store the chosen language.
      lookupLocalStorage: "nextevent_lang",
    },

    // While a lazy namespace is loading, t("key") returns the key string
    // rather than suspending the component. This keeps the UX seamless
    // since page-level lazy loading (React.lazy) already shows a spinner.
    // bindI18n: 'languageChanged loaded' — trigger re-renders both when the
    // user switches language AND when a lazy namespace finishes downloading.
    // Without 'loaded', a component rendered while Hindi is still fetching
    // would stay on English fallback strings and never update.
    react: {
      useSuspense: false,
      bindI18n: "languageChanged loaded",
    },
  }

  await i18n
    // HttpBackend: fetches /locales/{lng}/{ns}.json on demand (non-English only).
    .use(HttpBackend)
    // LanguageDetector: reads localStorage → navigator.language.
    .use(LanguageDetector)
    // Wires i18n into React's context so useTranslation() works in any component.
    .use(initReactI18next)
    .init(options)
}

export default i18n
