import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const secretKey = process.env.CLERK_SECRET_KEY ?? "";
  const hasClerk =
    (publishableKey.startsWith("pk_live_") || publishableKey.startsWith("pk_test_")) &&
    secretKey.startsWith("sk_");

  if (!hasClerk) return NextResponse.next();

  try {
    const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
    const isPublic = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

    return clerkMiddleware(async (auth, req) => {
      if (!isPublic(req)) await auth.protect();
    })(request, { waitUntil: () => {} } as never);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ]
};
