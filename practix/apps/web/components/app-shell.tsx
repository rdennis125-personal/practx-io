"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { LogoPrimary } from "@/components/LogoPrimary";
import { LogoMark } from "@/components/LogoMark";
import { useEntitlements } from "./entitlement-context";

export function AppShell({ children }: { children: ReactNode }) {
  const { entitlements } = useEntitlements();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-text">
      <header className="border-b border-border bg-surface">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/app" className="flex min-h-[44px] items-center" aria-label="Practx home">
            <LogoPrimary width={168} />
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/elm"
              className="inline-flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-text-muted transition-colors hover:text-text"
            >
              ELM Workspace
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              <span>ELM</span>
              <span className="inline-flex items-center gap-1">
                <LogoMark size={20} variant="auto" />
                {entitlements.elm ? "Active" : "Locked"}
              </span>
            </div>
            {!entitlements.elm && (
              <Link href="/upgrade" className="btn btn--primary">
                Upgrade
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 lg:py-12">{children}</main>
    </div>
  );
}
