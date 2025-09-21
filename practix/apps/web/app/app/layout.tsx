import { ReactNode } from "react";
import { PractixMsalProvider } from "../../components/msal-provider";
import { EntitlementProvider } from "../../components/entitlement-context";
import { AppShell } from "../../components/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PractixMsalProvider>
      <EntitlementProvider>
        <AppShell>{children}</AppShell>
      </EntitlementProvider>
    </PractixMsalProvider>
  );
}
