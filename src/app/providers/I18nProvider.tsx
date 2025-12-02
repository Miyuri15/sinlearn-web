"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { initI18n } from "@/lib/i18n";

export default function I18nProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [i18nInstance, setI18nInstance] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const instance = await initI18n();
      setI18nInstance(instance);
    };

    load();
  }, []);

  if (!i18nInstance) return null;

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}
