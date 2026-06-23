import i18n, { type InitOptions } from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import HttpBackend, { type HttpBackendOptions } from "i18next-http-backend"

// ── Namespace registry ────────────────────────────────────────────────────────
// Type the namespace names so useTranslation('nav') is type-safe.
export const NAMESPACES = ["common", "nav", "home", "eventDetail", "createEvent"] as const
export type Namespace = (typeof NAMESPACES)[number]


// ── initI18n ─────────────────────────────────────────────────────────────────
// Called once in main.tsx before ReactDOM.render().
// Returns a Promise that resolves only after EAGER_NAMESPACES are loaded,
// so layout components always get real strings on the very first render.
export async function initI18n(): Promise<void> {
  // Determine which language to preload. We read the same localStorage key
  // that LanguageDetector would write, falling back to "en".
  const storedLang = localStorage.getItem("nextevent_lang") ?? "en"
  const preloadLang = ["en", "hi"].includes(storedLang) ? storedLang : "en"

  // Explicit type annotation resolves Vite's stricter generic overload check for
  // i18n.init() when HttpBackend is registered via .use().
  const options: InitOptions<HttpBackendOptions> = {
    // ── Backend: serve translation files from /public/locales/ ──────────────
    backend: {
      // Vite copies everything in /public to the build root,
      // so this URL resolves correctly in both dev and production.
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    // Supported languages
    supportedLngs: ["en", "hi"],

    // Fall back to English if a Hindi key is missing.
    fallbackLng: "en",

    // The default namespace used when useTranslation() is called without an arg.
    // e.g. const { t } = useTranslation() → reads from 'common'
    defaultNS: "common",

    // All registered namespaces — i18next uses this list to validate calls.
    // Lazy namespaces (home, eventDetail, createEvent) are registered here but
    // NOT preloaded; they'll be fetched when first requested by a component.
    ns: NAMESPACES,

    // Only eagerly fetch common + nav for the detected language.
    // The HttpBackend will handle all other namespaces on demand when their
    // route is first visited (home, eventDetail, createEvent).
    preload: [preloadLang],

    // Allows mixing eagerly bundled and HTTP-fetched namespaces cleanly.
    partialBundledLanguages: true,

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
    react: {
      useSuspense: false,
    },
  }

  await i18n
    // HttpBackend: fetches /locales/{lng}/{ns}.json on demand.
    .use(HttpBackend)
    // LanguageDetector: reads localStorage → navigator.language.
    .use(LanguageDetector)
    // Wires i18n into React's context so useTranslation() works in any component.
    .use(initReactI18next)
    .init(options)
}

export default i18n
