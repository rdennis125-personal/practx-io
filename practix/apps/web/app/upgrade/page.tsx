"use client";

import { useState } from "react";
import axios from "axios";
import { appConfig } from "../../lib/config";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
    <section className="mx-auto max-w-4xl space-y-10">
      <header className="stack-md">
        <h1 className="text-4xl font-semibold text-text">Unlock Equipment Lifecycle Management</h1>
        <p className="text-lg text-text-muted">
          Upgrade your organization to access the ELM workspace. Pricing reflects MSRP and billing is handled securely via
          Stripe Checkout.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>ELM Pro</CardTitle>
          <CardDescription>Everything you need to orchestrate practice equipment with confidence.</CardDescription>
        </CardHeader>
        <CardContent className="gap-4 text-sm text-text-muted">
          <ul className="space-y-2">
            <li>✅ Unlimited device tracking</li>
            <li>✅ TPM contract repository</li>
            <li>✅ Dealer order logging</li>
            <li>✅ Entitlement-backed API access</li>
          </ul>
          <p className="text-3xl font-semibold text-text">
            $499<span className="ml-2 text-base font-normal text-text-muted">/mo MSRP</span>
          </p>
          <p className="text-sm text-text-subtle">
            Need enterprise rollout? <a className="text-brand-600 hover:underline" href="mailto:hello@practx.io">Contact sales</a> for
            tailored onboarding.
          </p>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text-muted">Includes practice onboarding, entitlement setup, and dealer training.</p>
            {error && <p className="mt-2 rounded-md bg-warning-bg px-3 py-2 text-sm text-warning">{error}</p>}
          </div>
          <Button onClick={startCheckout} disabled={loading} size="lg">
            {loading ? "Redirecting to Stripe…" : "Upgrade with Stripe"}
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
