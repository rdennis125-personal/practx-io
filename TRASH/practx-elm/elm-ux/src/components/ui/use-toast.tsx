import * as React from 'react';
import { Toast, ToastProvider, ToastViewport } from './toast';

type ToastVariant = 'default' | 'destructive';

interface ToastMessage {
  id: number;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  publish: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const ToastProviderWithQueue: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const publish = React.useCallback<ToastContextValue['publish']>((message) => {
    setToasts((current) => [...current, { id: Date.now(), ...message }]);
  }, []);

  const remove = React.useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ publish }}>
      <ToastProvider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            open
            duration={toast.duration ?? 4000}
            onOpenChange={(open) => {
              if (!open) {
                remove(toast.id);
              }
            }}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
          />
        ))}
        <ToastViewport className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-[360px] flex-col gap-2 outline-none" />
      </ToastProvider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProviderWithQueue');
  }
  return context;
};
