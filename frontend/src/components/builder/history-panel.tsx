"use client";

import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Layers,
  Play,
  XCircle,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";

import { useBuilderStore } from "@/stores/use-builder-store";
import type { WorkflowRunRecord } from "@/types/workflow";

function RelativeTime({ date }: { date: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function format() {
      const diff = Date.now() - new Date(date).getTime();
      const s = Math.floor(diff / 1000);
      if (s < 60) return `${s}s ago`;
      const m = Math.floor(s / 60);
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      return new Date(date).toLocaleDateString();
    }
    setLabel(format());
    const id = setInterval(() => setLabel(format()), 30_000);
    return () => clearInterval(id);
  }, [date]);

  return <span>{label}</span>;
}

function StatusBadge({ status }: { status: WorkflowRunRecord["status"] }) {
  const styles = {
    success: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    failed: "bg-rose-400/10 text-rose-400 border-rose-400/20",
    running: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    queued: "bg-slate-400/10 text-slate-400 border-slate-400/20"
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function NodeRunRow({
  nodeRun
}: {
  nodeRun: WorkflowRunRecord["nodeRuns"][number];
}) {
  const iconClass =
    nodeRun.status === "success"
      ? "text-emerald-400"
      : nodeRun.status === "failed"
        ? "text-rose-400"
        : "text-amber-400";

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
      <div className="mt-0.5">
        {nodeRun.status === "success" ? (
          <CheckCircle2 size={12} className="text-emerald-400" />
        ) : nodeRun.status === "failed" ? (
          <XCircle size={12} className="text-rose-400" />
        ) : (
          <div className="h-3 w-3 rounded-full border border-amber-400/50 bg-amber-400/20" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[12px] font-medium text-slate-200">
            {nodeRun.nodeType}
          </span>
          <span className={`shrink-0 text-[10px] ${iconClass}`}>
            {nodeRun.durationMs != null ? `${nodeRun.durationMs}ms` : "—"}
          </span>
        </div>
        <div className="mt-0.5 truncate text-[10px] text-slate-600">
          {nodeRun.nodeId}
        </div>
        {nodeRun.error && (
          <div className="mt-1 rounded-lg border border-rose-400/15 bg-rose-400/[0.06] px-2 py-1 text-[10px] text-rose-300">
            {nodeRun.error}
          </div>
        )}
        {nodeRun.outputs && nodeRun.status === "success" && (
          <div className="mt-1 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] px-2 py-1 text-[10px] text-emerald-300/70">
            {typeof nodeRun.outputs === "object"
              ? Object.entries(nodeRun.outputs)
                  .map(([k, v]) => `${k}: ${String(v).slice(0, 40)}`)
                  .join(" · ")
              : String(nodeRun.outputs).slice(0, 60)}
          </div>
        )}
      </div>
    </div>
  );
}

function RunCard({ run, index }: { run: WorkflowRunRecord; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const scopeLabel =
    run.scope === "full"
      ? "Full Run"
      : run.scope === "partial"
        ? "Partial Run"
        : "Node Run";

  return (
    <div className="overflow-hidden rounded-[16px] border border-white/[0.07] bg-white/[0.02]">
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
          <Play size={11} className="text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-slate-100">
              #{String(index + 1).padStart(2, "0")} {scopeLabel}
            </span>
            <StatusBadge status={run.status} />
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              <RelativeTime date={run.startedAt} />
            </span>
            {run.durationMs != null && (
              <span className="flex items-center gap-1">
                <Zap size={10} />
                {run.durationMs}ms
              </span>
            )}
            <span className="flex items-center gap-1">
              <Layers size={10} />
              {run.nodeRuns.length} nodes
            </span>
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-600 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && run.nodeRuns.length > 0 && (
        <div className="border-t border-white/[0.05] px-3 py-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Node Executions
          </div>
          <div className="space-y-1.5">
            {run.nodeRuns.map((nr) => (
              <NodeRunRow key={nr.id} nodeRun={nr} />
            ))}
          </div>
        </div>
      )}

      {expanded && run.summary && (
        <div className="border-t border-white/[0.05] px-4 py-2.5">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={11} />
              {run.summary.completedNodes} succeeded
            </span>
            {(run.summary.failedNodes ?? 0) > 0 && (
              <span className="flex items-center gap-1.5 text-rose-400">
                <XCircle size={11} />
                {run.summary.failedNodes} failed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoryPanel() {
  const runs = useBuilderStore((s) => s.runs);

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#0d1118]">
      <div className="border-b border-white/[0.06] px-4 py-4">
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
          Workflow
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-semibold text-slate-100">Run History</div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[12px] font-medium text-slate-400">
            {runs.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <Play size={18} className="text-slate-600" />
            </div>
            <p className="text-[13px] font-medium text-slate-500">No runs yet</p>
            <p className="mt-1 text-[11px] text-slate-700">
              Run your workflow to see history
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map((run, i) => (
              <RunCard key={run.id} run={run} index={i} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
