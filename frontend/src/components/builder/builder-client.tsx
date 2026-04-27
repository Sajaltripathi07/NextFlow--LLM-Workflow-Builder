"use client";

import dynamic from "next/dynamic";

const BuilderLayout = dynamic(
  () => import("@/components/builder/builder-layout").then((mod) => ({ default: mod.BuilderLayout })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-[#07090e]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/[0.08] border-t-cyan-400" />
          <span className="text-[13px] text-slate-600">Loading NextFlow…</span>
        </div>
      </div>
    )
  }
);

export function BuilderClient({ userId }: { userId: string }) {
  return <BuilderLayout userId={userId} />;
}
