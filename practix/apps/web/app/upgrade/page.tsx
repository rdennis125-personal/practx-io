"use client";

import { useState } from "react";
import axios from "axios";
import { appConfig } from "../../lib/config";

type CheckoutResponse = {
  checkoutUrl: string;
};

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const startCheckout = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await axios.post<CheckoutResponse>(`${appConfig.apiBaseUrl}/billing/checkout`, {}, { withCredentials: true });
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      setError("Unable to start checkout. Contact support if the issue persists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold text-slate-900">Unlock Equipment Lifecycle Management</h1>
        <p className="text-lg text-slate-600">
          Upgrade your organization to access the ELM workspace. Pricing reflects MSRP and billing is handled securely via
          Stripe Checkout.
        </p>
      </header>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-brand">ELM Pro</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>✅ Unlimited device tracking</li>
          <li>✅ TPM contract repository</li>
          <li>✅ Dealer order logging</li>
          <li>✅ Entitlement-backed API access</li>
        </ul>
        <p className="mt-6 text-3xl font-bold text-slate-900">$499<span className="text-base font-normal text-slate-500">/mo MSRP</span></p>
        <button
          onClick={startCheckout}
          disabled={loading}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-base font-semibold text-white shadow hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Redirecting to Stripe..." : "Upgrade with Stripe"}
        </button>
        {error && <p className="mt-4 rounded bg-amber-100 px-4 py-2 text-sm text-amber-800">{error}</p>}
      </div>
    </section>
  );
}
