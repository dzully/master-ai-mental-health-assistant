"use client";

import { QueryProvider } from "./query-provider";
import { IntlProvider } from "./intl-provider";
import { MotionProvider } from "./motion-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <IntlProvider>
        <MotionProvider>{children}</MotionProvider>
      </IntlProvider>
    </QueryProvider>
  );
}

export { QueryProvider, IntlProvider, MotionProvider };
