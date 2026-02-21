import "@/styles/globals.css";
import clsx from "clsx";
import { AppProviders as Providers } from "@/providers/AppProviders";
import { fontSans } from "@/config/fonts";
import { NavigationHeader } from "@/components/parking/NavigationHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function Layout({ children }) {
  return (
    <div
      className={clsx(
        "min-h-screen text-foreground bg-background font-sans antialiased",
        fontSans.variable,
      )}
    >
      <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
        <AuthGuard>
          <div className="relative flex flex-col min-h-screen p-4 md:p-8">
            {/* Global Background decoration */}
            <div className="fixed inset-0 pointer-events-none z-[-1] animate-pulse-slow">
              <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-green-500/10 rounded-full blur-[100px]" />
            </div>

            <main className="container mx-auto max-w-7xl flex-grow px-0">
              <NavigationHeader />
              {children}
            </main>
          </div>
        </AuthGuard>
      </Providers>
    </div>
  );
}
