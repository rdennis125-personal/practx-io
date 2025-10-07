import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Navbar,
  Tabs,
  ThemeToggle as ThemeToggleButton
} from "@/ui";
import { LogoMark } from "@/components/LogoMark";

const heroFeatures = [
  {
    title: "Operatory clarity",
    description: "Track every chair, sterilizer, and sensor with proactive service milestones for the clinical team."
  },
  {
    title: "Dental-first rollout",
    description: "Launch with curated dental equipment catalogs, dealer mappings, and compliance templates."
  },
  {
    title: "Accountable service",
    description: "Automate reminders for PM visits, warranty expirations, and dealer escalations in one command center."
  }
];

export default function HomePage() {
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <p className="text-base text-[color:var(--color-neutral-700)]">
          Practx synchronizes equipment lifecycle, service coverage, and compliance signals so every operatory stays ready.
        </p>
      )
    },
    {
      id: "automation",
      label: "Automation",
      content: (
        <p className="text-base text-[color:var(--color-neutral-700)]">
          Automations keep PM visits on track, trigger escalations, and notify dealer partners the moment a threshold is met.
        </p>
      )
    },
    {
      id: "analytics",
      label: "Analytics",
      content: (
        <p className="text-base text-[color:var(--color-neutral-700)]">
          Real-time dashboards highlight chair uptime, warranty runway, and high-risk assets that demand immediate attention.
        </p>
      )
    }
  ];

  return (
    <main className="bg-[var(--color-white)] text-[color:var(--color-neutral-900)]">
      <Navbar
        brand={
          <Link href="/" className="flex items-center gap-2" aria-label="Practx home">
            <LogoMark size={32} />
            <span className="text-lg font-semibold text-[color:var(--color-deep-navy)]">Practx</span>
          </Link>
        }
        links={[
          { label: "Platform", href: "#platform" },
          { label: "Security", href: "#trust" },
          { label: "Docs", href: "/upgrade" }
        ]}
        endSlot={
          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <Link href="/app" className="btn btn--ghost">
              Sign in
            </Link>
          </div>
        }
      />

      <header className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-start">
          <div className="stack-md">
            <span className="badge badge--success max-w-max">Practice-centered equipment lifecycle</span>
            <h1 className="text-balance text-4xl font-bold text-[color:var(--color-deep-navy)]">
              Keep every operatory performing with Practx
            </h1>
            <p className="max-w-2xl text-lg text-[color:var(--color-neutral-700)]">
              Practx unites asset intelligence, service coverage, and dealer accountability so dental practices deliver
              chairside care without disruption. Extend the same operating model to any practice-centered business as you
              grow.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/app" className="btn btn--primary">
                Get started
              </Link>
              <Link href="/upgrade" className="btn btn--accent">
                Explore pricing
              </Link>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle coverage built for dental teams</CardTitle>
              <CardDescription>
                Practx keeps operations managers and dealer partners aligned with contextual tasks and automation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs items={tabs} />
              <Alert variant="info" title="New">
                Practitioner rollouts now support franchise hierarchies and delegated administration.
              </Alert>
            </CardContent>
            <CardFooter>
              <Link href="#platform" className="btn btn--ghost">
                Discover the platform
              </Link>
            </CardFooter>
          </Card>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {heroFeatures.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </header>

      <section id="platform" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:items-start">
          <Card>
            <CardHeader>
              <CardTitle>Plan the next service visit</CardTitle>
              <CardDescription>
                Practx keeps operations managers and dealer partners aligned with contextual tasks and automation.
              </CardDescription>
            </CardHeader>
              <CardContent className="gap-6">
                <div className="flex items-center gap-3 text-sm font-medium text-[color:var(--color-neutral-700)]">
                  <LogoMark size={32} />
                  <span>Operatory 3 · Steri-Vac Sterilizer</span>
                </div>
                <Input label="Dealer contact" placeholder="dealer@trustedrep.com" helperText="We&apos;ll copy them on the work order." />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Preferred date" type="date" required />
                  <Input label="Window" placeholder="8:00 AM – 11:00 AM" />
                </div>
                <Input
                  label="Notes for the field tech"
                  placeholder="Recalibrate pressure sensor after routine maintenance."
                  helperText="Keep notes action-oriented and secure—patients are never referenced."
                  multiline
                />
              </CardContent>
              <CardFooter className="justify-between">
                <p className="text-sm text-[color:var(--color-neutral-500)]">
                  Every request is logged with entitlement checks and audit trails.
                </p>
                <Button type="button">Send to dealer</Button>
              </CardFooter>
            </Card>

            <div className="stack-lg">
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle at a glance</CardTitle>
                <CardDescription>
                  Measure chair uptime, sterilization readiness, and imaging compliance across every operatory.
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-4">
                <div className="flex items-center justify-between rounded-xl bg-[color:var(--color-neutral-100)] px-4 py-3">
                  <span className="text-sm font-medium text-[color:var(--color-primary-800)]">Ready operatories</span>
                  <span className="text-2xl font-semibold text-[color:var(--color-deep-navy)]">18 / 20</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[color:var(--color-neutral-100)] px-4 py-3">
                  <span className="text-sm font-medium text-[color:var(--color-neutral-700)]">Preventive visits scheduled</span>
                  <span className="text-lg font-semibold text-[color:var(--color-neutral-900)]">12</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[color:var(--color-neutral-100)] px-4 py-3">
                  <span className="text-sm font-medium text-[color:var(--color-neutral-700)]">Warranties expiring next 30 days</span>
                  <span className="text-lg font-semibold text-[color:var(--color-accent-800)]">3</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Compliance is built-in</CardTitle>
                <CardDescription>
                  Practx aligns with HIPAA and dental board standards while supporting Azure-native identity controls.
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-4 text-sm text-[color:var(--color-neutral-700)]">
                <p>✔️ Azure Entra External ID with adaptive MFA</p>
                <p>✔️ SOC 2 Type II controls in progress</p>
                <p>✔️ End-to-end audit trails for every entitlement change</p>
              </CardContent>
              <CardFooter className="justify-end">
                <Link href="#trust" className="btn btn--ghost">
                  Review trust posture
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section id="trust" className="border-t border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-100)] px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <h2 className="text-balance text-3xl font-semibold text-[color:var(--color-deep-navy)]">
            Secure practice data every step of the way
          </h2>
          <p className="max-w-3xl text-lg text-[color:var(--color-neutral-700)]">
            Practx was designed alongside dental DSOs and solo practices alike. Service teams gain the context they need while
            respecting PHI boundaries and keeping chairside workflows moving.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Role-based entitlements</CardTitle>
                <CardDescription>
                  Connect your practice management system and scope access by location, operatory, or dealer partner.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Automated alerts</CardTitle>
                <CardDescription>
                  Escalate downtime risks with brand-aligned notifications and actionable tasks across teams.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Insights that travel</CardTitle>
                <CardDescription>
                  Share curated dashboards with dealers or OEMs without exposing patient-identifiable data.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
