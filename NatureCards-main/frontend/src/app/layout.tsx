import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { ToastProvider } from "@/providers/toast-provider";
import { AuthProvider } from "@/providers/session-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

export const metadata: Metadata = {
  title: "NatureCards",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`antialiased relative min-h-screen mb-16`}
      >
        <AuthProvider>
          <ToastProvider>
            <NextSSRPlugin
              /**
               * Extract only the route configs to prevent leaking 
               * additional information to the client
               */
              routerConfig={extractRouterConfig(ourFileRouter)}
            />
            {children}
            <Navigation userId={session?.user?.id || ''} />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
