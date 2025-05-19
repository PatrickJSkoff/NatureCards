import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = React.createContext<{
  open: (content: React.ReactNode, options?: ToastOptions) => void;
  dismiss: () => void;
}>({
  open: () => {},
  dismiss: () => {},
});

export const useToast = () => {
  const context = React.useContext(ToastProvider);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "bg-background border",
        success: "success group border-green-500 bg-green-50 text-green-800",
        destructive:
          "destructive group border-red-500 bg-red-50 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type ToastOptions = {
  duration?: number;
  variant?: "default" | "success" | "destructive";
};

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({
  className,
  variant,
  children,
  duration = 5000,
  onDismiss,
  ...props
}: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex-1">{children}</div>
      <button
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:text-gray-700"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
}

export function ToastTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

export function ToastDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  );
}

export function ToastContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]",
        className
      )}
      {...props}
    />
  );
}

export function ToastProviderComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = React.useState<
    Array<{
      id: string;
      content: React.ReactNode;
      duration?: number;
      variant?: "default" | "success" | "destructive";
    }>
  >([]);

  const open = React.useCallback(
    (content: React.ReactNode, options?: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [
        ...prev,
        {
          id,
          content,
          duration: options?.duration,
          variant: options?.variant,
        },
      ]);
    },
    []
  );

  const dismiss = React.useCallback((id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    } else if (toasts.length > 0) {
      // If no ID is provided, remove the oldest toast
      setToasts((prev) => prev.slice(1));
    }
  }, [toasts]);

  const contextValue = React.useMemo(() => ({ open, dismiss }), [open, dismiss]);

  return (
    <ToastProvider.Provider value={contextValue}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            duration={toast.duration}
            variant={toast.variant}
            onDismiss={() => dismiss(toast.id)}
          >
            {toast.content}
          </Toast>
        ))}
      </ToastContainer>
    </ToastProvider.Provider>
  );
} 