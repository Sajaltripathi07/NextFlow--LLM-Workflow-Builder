import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextFlow — LLM Workflow Builder",
  description: "Visual LLM workflow builder powered by Gemini"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const secretKey = process.env.CLERK_SECRET_KEY ?? "";
  const hasClerk =
    (publishableKey.startsWith("pk_live_") || publishableKey.startsWith("pk_test_")) &&
    secretKey.startsWith("sk_");

  const content = (
    <>
      {children}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#0d1118",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#f1f5f9"
          }
        }}
      />
    </>
  );

  if (hasClerk) {
    try {
      const { ClerkProvider } = await import("@clerk/nextjs");
      return (
        <html lang="en" suppressHydrationWarning>
          <body suppressHydrationWarning>
            <ClerkProvider>{content}</ClerkProvider>
          </body>
        </html>
      );
    } catch {
      // fall through to no-clerk layout
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{content}</body>
    </html>
  );
}
