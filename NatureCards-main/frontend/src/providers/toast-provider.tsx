"use client";

import { ToastProviderComponent } from "@/components/ui/toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastProviderComponent>{children}</ToastProviderComponent>;
} 