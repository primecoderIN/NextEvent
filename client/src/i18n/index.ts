import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

// ── Namespace imports — English ───────────────────────────────────────────────
// Static imports are bundled by Vite at build time (no runtime HTTP fetch).
// Each file corresponds to one i18next namespace.
import enCommon from "@/i18n/locales/en/common.json"
import enNav from "@/i18n/locales/en/nav.json"
import enHome from "@/i18n/locales/en/home.json"
import enEventDetail from "@/i18n/locales/en/eventDetail.json"
import enCreateEvent from "@/i18n/locales/en/createEvent.json"

// ── Namespace imports — Hindi ─────────────────────────────────────────────────
import hiCommon from "@/i18n/locales/hi/common.json"
import hiNav from "@/i18n/locales/hi/nav.json"
import hiHome from "@/i18n/locales/hi/home.json"
import hiEventDetail from "@/i18n/locales/hi/eventDetail.json"
import hiCreateEvent from "@/i18n/locales/hi/createEvent.json"

// ── i18next namespace registry ────────────────────────────────────────────────
// Type the namespace names so useTranslation('nav') is type-safe.
export const NAMESPACES = ["common", "nav", "home", "eventDetail", "createEvent"] as const
export type Namespace = (typeof NAMESPACES)[number]

i18n
  // LanguageDetector reads (in order): localStorage → navigator.language.
  // It writes the user's choice back to localStorage so it persists across sessions.
  .use(LanguageDetector)
  // Wires i18n into React's context so useTranslation() works in any component.
  .use(initReactI18next)
  .init({
    // ── Resources: structured as resources[lng][namespace] = translations ──
    resources: {
      en: {
        common: enCommon,
        nav: enNav,
        home: enHome,
        eventDetail: enEventDetail,
        createEvent: enCreateEvent,
      },
      hi: {
        common: hiCommon,
        nav: hiNav,
        home: hiHome,
        eventDetail: hiEventDetail,
        createEvent: hiCreateEvent,
      },
    },

    // Supported languages
    supportedLngs: ["en", "hi"],

    // Fall back to English if a Hindi key is missing — no missing-key errors shown to user.
    fallbackLng: "en",

    // The default namespace used when useTranslation() is called without a namespace arg.
    // e.g. const { t } = useTranslation() → reads from 'common'
    defaultNS: "common",

    // All registered namespaces — needed so i18next knows what to validate/preload.
    ns: NAMESPACES,

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
  })

export default i18n
