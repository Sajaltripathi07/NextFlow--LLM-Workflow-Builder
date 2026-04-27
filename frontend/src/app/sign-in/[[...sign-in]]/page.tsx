export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07090e]">
      <div className="w-full max-w-md">
        <ClerkSignIn />
      </div>
    </div>
  );
}

async function ClerkSignIn() {
  try {
    const { SignIn } = await import("@clerk/nextjs");
    return <SignIn />;
  } catch {
    return (
      <div className="rounded-[20px] border border-white/[0.07] bg-[#0d1118] p-8 text-center">
        <p className="text-slate-400">Clerk not configured — running in demo mode</p>
        <a
          href="/"
          className="mt-4 inline-block rounded-xl bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/15"
        >
          Open Builder
        </a>
      </div>
    );
  }
}
