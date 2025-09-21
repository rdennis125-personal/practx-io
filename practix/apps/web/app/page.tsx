import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-16 px-6 py-24 text-center">
      <div className="space-y-6">
        <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">PRACTIX</span>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          A modern lifecycle platform for medical imaging equipment
        </h1>
        <p className="text-xl text-slate-600">
          Practix keeps every piece of equipment covered, compliant, and ready for care. Track devices, TPM contracts, and
          dealer orders in one secure workspace.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/app"
            className="rounded-lg bg-brand px-6 py-3 text-base font-semibold text-white shadow hover:bg-brand-light"
          >
            Sign in
          </Link>
          <Link
            href="/upgrade"
            className="rounded-lg border border-brand px-6 py-3 text-base font-semibold text-brand hover:bg-brand/5"
          >
            Explore pricing
          </Link>
        </div>
      </div>
      <div className="grid w-full gap-6 rounded-2xl bg-white p-10 shadow-lg md:grid-cols-3">
        <div>
          <h2 className="text-lg font-semibold">Lifecycle clarity</h2>
          <p className="mt-2 text-sm text-slate-500">
            Map every device, its coverage dates, responsible dealer, and next actions with automated reminders.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Billing ready</h2>
          <p className="mt-2 text-sm text-slate-500">
            Upgrade instantly with Stripe Billing and unlock the Equipment Lifecycle Management workspace for your org.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Secure by design</h2>
          <p className="mt-2 text-sm text-slate-500">
            Entra External ID safeguards access with B2C authentication and entitlement checks for every module.
          </p>
        </div>
      </div>
    </main>
  );
}
