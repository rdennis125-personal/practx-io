"use client";

import Link from "next/link";
import { useEntitlements } from "../../components/entitlement-context";

export default function DashboardPage() {
  const { entitlements, loading, error } = useEntitlements();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Welcome to Practix</h1>
        <p className="mt-2 text-slate-600">
          Manage your organization&apos;s equipment lifecycle. Entitlements control access to specialized workspaces.
        </p>
      </header>
      {loading && <p className="text-sm text-slate-500">Loading entitlements...</p>}
      {error && <p className="rounded bg-amber-100 px-4 py-2 text-sm text-amber-800">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Equipment Lifecycle Management</h2>
          <p className="mt-2 text-sm text-slate-600">
            Track OEM devices, TPM contracts, and dealer orders from a single command center.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                entitlements.elm ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {entitlements.elm ? "Entitled" : "Upgrade required"}
            </span>
            <Link
              href={entitlements.elm ? "/elm" : "/upgrade"}
              className="text-sm font-semibold text-brand hover:text-brand-light"
            >
              {entitlements.elm ? "Go to workspace" : "Upgrade now"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
