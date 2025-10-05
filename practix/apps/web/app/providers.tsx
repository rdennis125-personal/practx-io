"use client";

import type { PropsWithChildren } from "react";
import { ToastProvider } from "@/ui";

export function Providers({ children }: PropsWithChildren) {
  return <ToastProvider>{children}</ToastProvider>;
}
