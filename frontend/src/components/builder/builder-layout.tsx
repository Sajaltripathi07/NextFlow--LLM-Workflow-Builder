"use client";

import { CanvasShell } from "@/components/builder/canvas-shell";
import { HistoryPanel } from "@/components/builder/history-panel";
import { NodeLibrary } from "@/components/builder/node-library";
import { TopBar } from "@/components/builder/top-bar";

interface BuilderLayoutProps {
  userId: string;
}

export function BuilderLayout({ userId }: BuilderLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col gap-2 overflow-hidden bg-[#07090e] p-2">
      <TopBar userId={userId} />

      <div className="flex min-h-0 flex-1 gap-2">
        <div className="h-full w-[230px] shrink-0">
          <NodeLibrary />
        </div>

        <div className="min-w-0 flex-1">
          <CanvasShell />
        </div>

        <div className="h-full w-[280px] shrink-0">
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}
