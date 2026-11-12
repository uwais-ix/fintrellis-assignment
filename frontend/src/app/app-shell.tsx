import { Link, Outlet } from "react-router";
import { AccountMenu } from "@/features/auth/components/account-menu";
import { MockControls } from "@/features/auth/components/mock-controls";
import { useSession } from "@/features/auth/session";
import { ThemeToggle } from "./theme-toggle";

export function AppShell() {
  const session = useSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
          <Link to="/" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Journal<span className="text-primary">.</span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
            <Link
              to="/"
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Notes
            </Link>
            {session.canCreate ? (
              <Link
                to="/posts/new"
                className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Write
              </Link>
            ) : null}
          </nav>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <MockControls />
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground">
          <p>A small editorial workspace built with React, Spring Boot, and PostgreSQL.</p>
          <p>
            {session.status === "authenticated" ? `Signed in as ${session.name}` : "Public reading"}
          </p>
        </div>
      </footer>
    </div>
  );
}
