"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useEntitlements } from "../../components/entitlement-context";
import { appConfig } from "../../lib/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
      <Card className="border-dashed border-warning bg-warning-bg">
        <CardHeader>
          <CardTitle>Checking ELM entitlement…</CardTitle>
          <CardDescription>
            Upgrade to unlock the Equipment Lifecycle Management workspace for your dental locations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/upgrade" className="btn btn--primary">
            Upgrade now
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="stack-lg">
      <header className="stack-md">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-text">Equipment Lifecycle Management</h1>
          <p className="text-lg text-text-muted">
            Track practice equipment, maintenance coverage, and dealer relationships across every operatory.
          </p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
          <span>ELM entitlement active</span>
          <span className="rounded-full bg-brand-200 px-2 py-1 text-xs uppercase text-brand-700">Dental</span>
        </div>
      </header>
      {error && <p className="rounded-md bg-warning-bg px-4 py-2 text-sm text-warning">{error}</p>}
      <Card>
        <CardHeader>
          <CardTitle>Operatory devices</CardTitle>
          <CardDescription>Stay ahead of downtime with live device status and coverage insights.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3">OEM</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Serial</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.deviceId} className="border-b border-border text-text">
                    <td className="px-4 py-3 font-medium">{device.oem}</td>
                    <td className="px-4 py-3 text-text-muted">{device.model}</td>
                    <td className="px-4 py-3 text-text-muted">{device.serial}</td>
                    <td className="px-4 py-3">
                      <span className="badge badge--brand">{device.status}</span>
                    </td>
                  </tr>
                ))}
                {devices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                      No devices yet. Use the API or upcoming forms to add equipment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardContent className="gap-4 border-t border-border bg-surface-muted">
          <p className="text-sm text-text-muted">
            Import devices via the API or sync a spreadsheet—Practx keeps dealer metadata and coverage windows aligned.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button">Add device</Button>
            <Button type="button" variant="subtle">
              Upload spreadsheet
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
