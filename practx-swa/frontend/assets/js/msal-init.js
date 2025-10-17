import { PublicClientApplication } from "https://cdn.jsdelivr.net/npm/@azure/msal-browser@2.39.0/lib/msal-browser.min.js";

export const msalReady = (async () => {
  const res = await fetch('/assets/config/msal.json', { cache: 'no-store' });
  const cfg = await res.json();
  const msal = new PublicClientApplication({
    auth: {
      clientId: cfg.clientId,
      authority: cfg.authority,
      redirectUri: cfg.redirectUri
      // postLogoutRedirectUri is handled by SWA logout + app registration; no need to set here
    },
    cache: { cacheLocation: "sessionStorage" }
  });
  const accounts = msal.getAllAccounts();
  if (accounts.length) msal.setActiveAccount(accounts[0]);
  return msal;
})();
