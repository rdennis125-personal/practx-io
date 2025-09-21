"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LogoPrimary } from "@/components/LogoPrimary";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

type HeaderLink = {
  label: string;
  href: string;
};

type CallToAction = HeaderLink & {
  variant?: "primary" | "subtle" | "ghost";
};

type Feature = {
  title: string;
  description: string;
  icon?: ReactNode;
};

type HeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  navLinks?: HeaderLink[];
  primaryCta: CallToAction;
  secondaryCta?: CallToAction;
  features?: Feature[];
};

export function Header({
  eyebrow,
  title,
  description,
  navLinks = [],
  primaryCta,
  secondaryCta,
  features
}: HeaderProps) {
  const resolveVariant = (variant?: CallToAction["variant"]) => {
    switch (variant) {
      case "ghost":
        return "btn btn--ghost";
      case "subtle":
        return "btn btn--subtle";
      case "primary":
      default:
        return "btn btn--primary";
    }
  };

  return (
    <header className="w-full border-b border-border bg-[var(--color-bg)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 md:gap-12 md:py-16">
        <nav className="flex flex-wrap items-center justify-between gap-6">
          <Link href="/" className="flex min-h-[44px] items-center" aria-label="Practx home">
            <LogoPrimary width={200} />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            <Link href={primaryCta.href} className={resolveVariant(primaryCta.variant)}>
              {primaryCta.label}
            </Link>
            {secondaryCta && (
              <Link href={secondaryCta.href} className={resolveVariant(secondaryCta.variant)}>
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </nav>
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-center">
          <div className="stack-md text-left">
            {eyebrow && <span className="eyebrow badge badge--brand">{eyebrow}</span>}
            <h1 className="headline-display max-w-2xl text-balance text-text">{title}</h1>
            <p className="max-w-2xl text-lg text-text-muted">{description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={primaryCta.href} className={resolveVariant(primaryCta.variant)}>
                {primaryCta.label}
              </Link>
              {secondaryCta && (
                <Link href={secondaryCta.href} className={resolveVariant(secondaryCta.variant)}>
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
          {features && features.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="h-full">
                  <CardHeader>
                    {feature.icon && <span className="text-2xl text-brand-600">{feature.icon}</span>}
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
