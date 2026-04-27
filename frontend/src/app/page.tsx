import { BuilderClient } from "@/components/builder/builder-client";

export default async function Home() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const secretKey = process.env.CLERK_SECRET_KEY ?? "";
  const hasClerk = publishableKey.startsWith("pk_live_") || publishableKey.startsWith("pk_test_") && secretKey.startsWith("sk_");

  if (!hasClerk) {
    return <BuilderClient userId="demo-user" />;
  }

  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();

    if (!userId) {
      const { redirect } = await import("next/navigation");
      redirect("/sign-in");
    }

    return <BuilderClient userId={userId!} />;
  } catch {
    return <BuilderClient userId="demo-user" />;
  }
}
