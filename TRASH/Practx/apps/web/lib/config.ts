export const appConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE ?? "/api",
  b2c: {
    authority: `https://${process.env.NEXT_PUBLIC_B2C_TENANT}.b2clogin.com/${process.env.NEXT_PUBLIC_B2C_TENANT}.onmicrosoft.com/${process.env.NEXT_PUBLIC_B2C_SIGNIN_POLICY}`,
    clientId: process.env.NEXT_PUBLIC_B2C_CLIENT_ID ?? "",
    redirectUri: process.env.NEXT_PUBLIC_B2C_REDIRECT_URI ?? "http://localhost:3000/app"
  }
};

export type Entitlements = {
  elm: boolean;
};

export const defaultEntitlements: Entitlements = {
  elm: false
};
