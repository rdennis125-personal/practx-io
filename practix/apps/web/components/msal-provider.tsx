"use client";

import { MsalProvider, PublicClientApplication } from "@azure/msal-react";
import { Configuration } from "@azure/msal-browser";
import { ReactNode, useMemo } from "react";
import { appConfig } from "../lib/config";

const baseConfig: Configuration = {
  auth: {
    clientId: appConfig.b2c.clientId,
    authority: appConfig.b2c.authority,
    knownAuthorities: [appConfig.b2c.authority.split("/")[2] ?? ""],
    redirectUri: appConfig.b2c.redirectUri
  },
  cache: {
    cacheLocation: "localStorage"
  }
};

export function PractixMsalProvider({ children }: { children: ReactNode }) {
  const instance = useMemo(() => new PublicClientApplication(baseConfig), []);
  return <MsalProvider instance={instance}>{children}</MsalProvider>;
}
