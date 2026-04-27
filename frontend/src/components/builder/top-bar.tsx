"use client";

import {
  ChevronDown,
  Loader2,
  Play,
  Redo2,
  Save,
  Undo2,
  Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useBuilderStore } from "@/stores/use-builder-store";

interface TopBarProps {
  userId: string;
}

export function TopBar({ userId }: TopBarProps) {
  const workflowName    = useBuilderStore((s) => s.workflowName);
  const setWorkflowName = useBuilderStore((s) => s.setWorkflowName);
  const isSaving        = useBuilderStore((s) => s.isSaving);
  const isRunning       = useBuilderStore((s) => s.isRunning);
  const past            = useBuilderStore((s) => s.past);
  const future          = useBuilderStore((s) => s.future);
  const selectedNodeIds = useBuilderStore((s) => s.selectedNodeIds);
  const saveWorkflow    = useBuilderStore((s) => s.saveWorkflow);
  const runWorkflow     = useBuilderStore((s) => s.runWorkflow);
  const undo            = useBuilderStore((s) => s.undo);
  const redo            = useBuilderStore((s) => s.redo);

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName]       = useState(workflowName);
  const [showRunMenu, setShowRunMenu] = useState(false);

  const hasSelection = selectedNodeIds.length > 0;

  async function handleSave() {
    try {
      await saveWorkflow(userId);
      toast.success("Workflow saved");
    } catch {
      toast.error("Failed to save workflow");
    }
  }

  async function handleRun(scope: "full" | "partial" | "node") {
    setShowRunMenu(false);
    if (scope !== "full" && !hasSelection) {
      toast.error("Select nodes first to run a partial workflow");
      return;
    }
    try {
      await runWorkflow(userId, scope);
      toast.success("Workflow completed successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Workflow failed");
    }
  }

  function commitName() {
    setEditingName(false);
    const trimmed = tempName.trim();
    if (trimmed) setWorkflowName(trimmed);
    else setTempName(workflowName);
  }

  return (
    <header
      suppressHydrationWarning
      className="flex h-14 shrink-0 items-center gap-3 rounded-[20px] border border-white/[0.07] bg-[#0d1118] px-4"
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
          <Zap size={13} className="text-cyan-400" strokeWidth={2} />
        </div>

        {editingName ? (
          <input
            suppressHydrationWarning
            autoFocus
            className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-[13px] font-semibold text-slate-100 outline-none"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName();
              if (e.key === "Escape") { setTempName(workflowName); setEditingName(false); }
            }}
          />
        ) : (
          <button
            suppressHydrationWarning
            type="button"
            className="max-w-[220px] truncate text-[13px] font-semibold text-slate-100 transition-colors hover:text-white"
            onClick={() => { setTempName(workflowName); setEditingName(true); }}
          >
            {workflowName}
          </button>
        )}
      </div>

      <div className="mx-2 h-5 w-px bg-white/[0.08]" />

      <div className="flex items-center gap-1.5">
        <button
          suppressHydrationWarning
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-slate-300 disabled:opacity-30"
          onClick={undo}
          disabled={past.length === 0}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </button>
        <button
          suppressHydrationWarning
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-slate-300 disabled:opacity-30"
          onClick={redo}
          disabled={future.length === 0}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={14} />
        </button>
      </div>

      <div className="mx-1 h-5 w-px bg-white/[0.08]" />

      <button
        suppressHydrationWarning
        type="button"
        className="flex h-8 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[13px] font-medium text-slate-300 transition-all hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-slate-100 disabled:opacity-50"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
        {isSaving ? "Saving…" : "Save"}
      </button>

      <div className="relative ml-auto">
        <div className="flex">
          <button
            suppressHydrationWarning
            type="button"
            className="flex h-8 items-center gap-2 rounded-l-xl border border-cyan-400/25 bg-cyan-400/10 px-3.5 text-[13px] font-semibold text-cyan-300 transition-all hover:bg-cyan-400/15 hover:text-cyan-200 disabled:opacity-50"
            onClick={() => handleRun("full")}
            disabled={isRunning}
          >
            {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
            {isRunning ? "Running…" : "Run All"}
          </button>
          <button
            suppressHydrationWarning
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-r-xl border border-l-0 border-cyan-400/25 bg-cyan-400/10 text-cyan-400/70 transition-all hover:bg-cyan-400/15 hover:text-cyan-300 disabled:opacity-50"
            onClick={() => setShowRunMenu((v) => !v)}
            disabled={isRunning}
          >
            <ChevronDown size={13} />
          </button>
        </div>

        {showRunMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowRunMenu(false)} />
            <div className="absolute right-0 top-10 z-20 min-w-[190px] overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#0d1118] shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
              <button
                suppressHydrationWarning
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-slate-100"
                onClick={() => handleRun("full")}
              >
                <Play size={12} fill="currentColor" className="text-cyan-400" />
                Run all nodes
              </button>
              <button
                suppressHydrationWarning
                type="button"
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-white/[0.04] ${hasSelection ? "text-slate-300 hover:text-slate-100" : "cursor-not-allowed text-slate-600"}`}
                onClick={() => handleRun("partial")}
              >
                <Play size={12} fill="currentColor" className={hasSelection ? "text-cyan-400" : "text-slate-600"} />
                Run selected ({selectedNodeIds.length})
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
