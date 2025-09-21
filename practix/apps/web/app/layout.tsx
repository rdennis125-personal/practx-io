import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ReactNode } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Practx",
  description: "Practice-centered equipment lifecycle management for dental teams and beyond"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
