"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import { createPortal } from "react-dom";

export type ToastVariant = "info" | "success" | "warn" | "danger";

export interface ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastInstance extends ToastOptions {
  id: number;
}

type ToastContextValue = {
  push: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);
  const idRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    ({ variant = "info", duration = 6000, ...rest }: ToastOptions) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((prev) => [...prev, { id, variant, duration, ...rest }]);
      window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div className="toast" role="region" aria-live="polite" aria-label="Notifications">
            {toasts.map((toast) => (
              <div key={toast.id} className={"toast__item " + getVariantClass(toast.variant)}>
                <div className="toast__body">
                  {toast.title ? <p className="toast__title">{toast.title}</p> : null}
                  {toast.description ? <p className="toast__description">{toast.description}</p> : null}
                </div>
                <button className="toast__close" type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
                  ×
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function getVariantClass(variant: ToastVariant = "info") {
  switch (variant) {
    case "success":
      return "toast__item--success";
    case "warn":
      return "toast__item--warn";
    case "danger":
      return "toast__item--danger";
    default:
      return "";
  }
}
