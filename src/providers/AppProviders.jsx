import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useNavigate } from "react-router-dom";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function AppProviders({ children, themeProps }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate}>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </HeroUIProvider>
  );
}
