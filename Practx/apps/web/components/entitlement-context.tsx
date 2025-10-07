"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { appConfig, defaultEntitlements, type Entitlements } from "../lib/config";

export interface EntitlementState {
  entitlements: Entitlements;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
}

const EntitlementContext = createContext<EntitlementState | undefined>(undefined);

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const [entitlements, setEntitlements] = useState<Entitlements>(defaultEntitlements);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();

  const fetchEntitlements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${appConfig.apiBaseUrl}/entitlements`, { withCredentials: true });
      setEntitlements({ elm: Boolean(res.data?.elm) });
      setError(undefined);
    } catch (err) {
      setEntitlements(defaultEntitlements);
      setError("Unable to load entitlements. Upgrade flow may be required.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEntitlements();
  }, []);

  const value = useMemo(
    () => ({
      entitlements,
      loading,
      error,
      refresh: fetchEntitlements
    }),
    [entitlements, loading, error]
  );

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}

export function useEntitlements() {
  const ctx = useContext(EntitlementContext);
  if (!ctx) {
    throw new Error("useEntitlements must be used within EntitlementProvider");
  }
  return ctx;
}
