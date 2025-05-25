"use client";

import { IntlProvider as ReactIntlProvider } from "react-intl";

interface IntlProviderProps {
  children: React.ReactNode;
  locale?: string;
}

const messages = {
  en: {
    "app.title": "AI Mental Health Assistant",
    "app.welcome": "Hello World",
    "app.description": "Welcome to your mental health companion",
  },
};

export function IntlProvider({ children, locale = "en" }: IntlProviderProps) {
  return (
    <ReactIntlProvider
      messages={messages[locale as keyof typeof messages]}
      locale={locale}
      defaultLocale="en"
    >
      {children}
    </ReactIntlProvider>
  );
}
