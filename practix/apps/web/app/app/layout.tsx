import { ReactNode } from "react";
import { PractxMsalProvider } from "../../components/msal-provider";
import { EntitlementProvider } from "../../components/entitlement-context";
import { AppShell } from "../../components/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PractxMsalProvider>
      <EntitlementProvider>
        <AppShell>{children}</AppShell>
      </EntitlementProvider>
    </PractxMsalProvider>
  );
}
