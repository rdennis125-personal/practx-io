"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useEntitlements } from "../../components/entitlement-context";
import { appConfig } from "../../lib/config";

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
      <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-6 text-amber-700">
        Checking ELM entitlement...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Equipment Lifecycle Management</h1>
        <p className="mt-2 text-slate-600">Track medical devices, maintenance coverage, and dealer relationships.</p>
      </header>
      {error && <p className="rounded bg-amber-100 px-4 py-2 text-sm text-amber-800">{error}</p>}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-500">OEM</th>
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-500">Model</th>
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-500">Serial</th>
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {devices.map((device) => (
              <tr key={device.deviceId}>
                <td className="px-4 py-3 font-medium text-slate-900">{device.oem}</td>
                <td className="px-4 py-3 text-slate-600">{device.model}</td>
                <td className="px-4 py-3 text-slate-600">{device.serial}</td>
                <td className="px-4 py-3 text-slate-600">{device.status}</td>
              </tr>
            ))}
            {devices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No devices yet. Use the API or upcoming forms to add equipment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
