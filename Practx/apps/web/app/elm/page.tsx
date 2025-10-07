"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useEntitlements } from "../../components/entitlement-context";
import { appConfig } from "../../lib/config";
import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui";

type Device = {
  deviceId: string;
  oem: string;
  model: string;
  serial: string;
  status: string;
};

export default function ElmPage() {
  const router = useRouter();
  const { entitlements, loading } = useEntitlements();
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!loading && !entitlements.elm) {
      router.replace("/upgrade");
    }
  }, [loading, entitlements, router]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${appConfig.apiBaseUrl}/elm/devices`, { withCredentials: true });
        setDevices(res.data ?? []);
        setError(undefined);
      } catch (err) {
        setError("Unable to load devices. Confirm entitlements and API connectivity.");
      }
    };

    if (entitlements.elm) {
      void load();
    }
  }, [entitlements]);

  if (!entitlements.elm) {
    return (
      <Alert variant="warn" title="Checking ELM entitlement…">
        <p className="text-sm text-neutral-700">
          Upgrade to unlock the Equipment Lifecycle Management workspace for your dental locations.
        </p>
        <Link href="/upgrade" className="btn btn--primary" style={{ marginTop: "var(--space-3)" }}>
          Upgrade now
        </Link>
      </Alert>
    );
  }

  return (
    <section className="stack-lg">
      <header className="stack-md">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-deepnavy">Equipment Lifecycle Management</h1>
          <p className="text-lg text-neutral-700">
            Track practice equipment, maintenance coverage, and dealer relationships across every operatory.
          </p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-full bg-[color:var(--color-neutral-100)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary-800)]">
          <span>ELM entitlement active</span>
          <span className="rounded-full bg-[color:var(--color-primary)] px-2 py-1 text-xs uppercase text-[color:var(--color-deep-navy)]">Dental</span>
        </div>
      </header>
      {error && (
        <p className="rounded-md border border-[color:var(--color-accent-800)] bg-[color:var(--color-neutral-100)] px-4 py-2 text-sm text-[color:var(--color-accent-800)]">
          {error}
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Operatory devices</CardTitle>
          <CardDescription>Stay ahead of downtime with live device status and coverage insights.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-100)] text-xs font-semibold uppercase tracking-wide text-neutral-600">
                <tr>
                  <th className="px-4 py-3">OEM</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Serial</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.deviceId} className="border-b border-[color:var(--color-neutral-100)] text-neutral-800">
                    <td className="px-4 py-3 font-medium">{device.oem}</td>
                    <td className="px-4 py-3 text-neutral-600">{device.model}</td>
                    <td className="px-4 py-3 text-neutral-600">{device.serial}</td>
                    <td className="px-4 py-3">
                      <span className="badge badge--brand">{device.status}</span>
                    </td>
                  </tr>
                ))}
                {devices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-neutral-600">
                      No devices yet. Use the API or upcoming forms to add equipment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardContent className="gap-4 border-t border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-100)]">
          <p className="text-sm text-neutral-600">
            Import devices via the API or sync a spreadsheet—Practx keeps dealer metadata and coverage windows aligned.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button">Add device</Button>
            <Button type="button" variant="accent">
              Upload spreadsheet
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
