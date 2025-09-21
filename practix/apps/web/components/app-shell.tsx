"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useEntitlements } from "./entitlement-context";

export function AppShell({ children }: { children: ReactNode }) {
  const { entitlements } = useEntitlements();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/app" className="text-xl font-semibold text-brand">
              PRACTIX
            </Link>
            <Link href="/elm" className="text-sm font-medium text-slate-600 hover:text-brand">
              ELM Workspace
            </Link>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
            <span>ELM</span>
            <span
              className={`rounded-full px-2 py-1 font-semibold ${
                entitlements.elm ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {entitlements.elm ? "Active" : "Locked"}
            </span>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
