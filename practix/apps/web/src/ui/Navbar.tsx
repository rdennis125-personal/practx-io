"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface NavbarLink {
  label: string;
  href: string;
}

export interface NavbarProps {
  brand: ReactNode;
  links?: NavbarLink[];
  endSlot?: ReactNode;
  className?: string;
}

export function Navbar({ brand, links = [], endSlot, className }: NavbarProps) {
  return (
    <nav className={cn("navbar", className)} aria-label="Primary">
      <div className="navbar__brand">{brand}</div>
      <div className="navbar__links" role="menubar">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="navbar__link" role="menuitem">
            {link.label}
          </Link>
        ))}
      </div>
      <div className="navbar__actions">{endSlot}</div>
    </nav>
  );
}
