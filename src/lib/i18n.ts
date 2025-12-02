import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";

export const initI18n = async () => {
  if (i18n.isInitialized) return i18n;

  await i18n
    .use(HttpApi)
    .use(initReactI18next)
    .init({
      supportedLngs: ["en", "si"],
      fallbackLng: "en",
      ns: ["common"],
      defaultNS: "common",
      backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
      detection: { order: ["localStorage", "navigator"] },
    });

  return i18n;
};
