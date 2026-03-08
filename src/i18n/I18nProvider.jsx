import { createContext, useContext, useMemo, useState } from "react";
import { translations } from "./translations";

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState("en");

  const value = useMemo(() => {
    const t = translations[language];
    const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "fr" : "en"));
    return { language, t, toggleLanguage };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
