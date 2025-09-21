"use client";

import Link from "next/link";
import { useEntitlements } from "../../components/entitlement-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { LogoMark } from "@/components/LogoMark";

export default function DashboardPage() {
  const { entitlements, loading, error } = useEntitlements();

  return (
    <section className="stack-lg">
      <header className="stack-md">
        <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
          <LogoMark size={28} />
          <span>Practx control center</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-text">Welcome to Practx</h1>
          <p className="text-lg text-text-muted">
            Manage practice equipment, service coverage, and dealer relationships. Entitlements unlock modules across the
            platform.
          </p>
        </div>
      </header>
      {loading && <p className="text-sm text-text-muted">Loading entitlements...</p>}
      {error && <p className="rounded-md bg-warning-bg px-4 py-2 text-sm text-warning">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Lifecycle Management</CardTitle>
            <CardDescription>
              Track OEM devices, TPM contracts, and dealer orders from a single command center tailored to dental practices.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 text-sm text-text-muted">
            <p>• Coordinate dealer service windows and preventive maintenance.</p>
            <p>• Monitor warranty coverage and flag expirations before they disrupt operatories.</p>
          </CardContent>
          <CardFooter className="justify-between">
            <span className={`badge ${entitlements.elm ? "badge--success" : "badge--warning"}`}>
              {entitlements.elm ? "Entitled" : "Upgrade required"}
            </span>
            <Link href={entitlements.elm ? "/elm" : "/upgrade"} className="btn btn--primary">
              {entitlements.elm ? "Open workspace" : "Upgrade now"}
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>API access</CardTitle>
            <CardDescription>Integrate Practx with your operations systems and trigger automated workflows.</CardDescription>
          </CardHeader>
          <CardContent className="gap-4 text-sm text-text-muted">
            <p>• REST and event hooks secured with Entra External ID.</p>
            <p>• Scoped tokens honor your entitlement configuration.</p>
          </CardContent>
          <CardFooter className="justify-end">
            <Link href="/docs" className="btn btn--ghost">
              View documentation
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
