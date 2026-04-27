"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  AlertCircle,
  CheckCircle2,
  Film,
  ImageIcon,
  Loader2,
  MessageSquare,
  Scissors,
  TextCursorInput,
  VideoIcon,
  WandSparkles,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useBuilderStore } from "@/stores/use-builder-store";
import type { WorkflowNode as WorkflowNodeType, WorkflowNodeData } from "@/types/workflow";

const handleStyle: React.CSSProperties = {
  width: 11,
  height: 11,
  borderRadius: "50%",
  border: "1.5px solid rgba(255,255,255,0.25)",
  background: "#1e293b"
};

const handleStyleAccent: React.CSSProperties = {
  ...handleStyle,
  border: "1.5px solid rgba(34,211,238,0.5)",
  background: "rgba(34,211,238,0.15)"
};

type ExecStatus = "idle" | "running" | "success" | "error";

function getExecStatus(data: WorkflowNodeData): ExecStatus {
  if ("status" in data) return data.status as ExecStatus;
  return "idle";
}

function nodeBoxStyle(status: ExecStatus, selected: boolean): React.CSSProperties {
  if (status === "running") {
    return {
      border: "1px solid #facc15",
      boxShadow: "0 0 0 2px #facc15, 0 0 20px rgba(250,204,21,0.35), 0 20px 50px rgba(0,0,0,0.5)"
    };
  }
  if (status === "success") {
    return {
      border: "1px solid #22c55e",
      boxShadow: "0 0 0 1px rgba(34,197,94,0.25), 0 20px 50px rgba(0,0,0,0.4)"
    };
  }
  if (status === "error") {
    return {
      border: "1px solid #ef4444",
      boxShadow: "0 0 0 1px rgba(239,68,68,0.25), 0 20px 50px rgba(0,0,0,0.4)"
    };
  }
  if (selected) {
    return {
      border: "1px solid rgba(34,211,238,0.4)",
      boxShadow: "0 0 0 1px rgba(34,211,238,0.2), 0 20px 50px rgba(0,0,0,0.5)"
    };
  }
  return {
    border: "1px solid rgba(255,255,255,0.07)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)"
  };
}

function nodeIconClass(status: ExecStatus): string {
  if (status === "running") return "bg-amber-400/10 text-amber-300";
  if (status === "success") return "bg-emerald-400/10 text-emerald-300";
  if (status === "error")   return "bg-rose-400/10 text-rose-300";
  return "bg-white/[0.06] text-slate-300";
}

function StatusBadge({ status }: { status: ExecStatus }) {
  if (status === "running") {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
        <Loader2 size={10} className="animate-spin" />
        Running
      </span>
    );
  }
  if (status === "success") {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
        <CheckCircle2 size={10} />
        Done
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
        <AlertCircle size={10} />
        Failed
      </span>
    );
  }
  return null;
}

function NodeIcon({ kind }: { kind: WorkflowNodeData["kind"] }) {
  const props = { size: 14, strokeWidth: 1.75 };
  switch (kind) {
    case "text":         return <TextCursorInput {...props} />;
    case "uploadImage":  return <ImageIcon {...props} />;
    case "uploadVideo":  return <VideoIcon {...props} />;
    case "runAnyLLM":   return <WandSparkles {...props} />;
    case "cropImage":   return <Scissors {...props} />;
    case "extractFrame": return <Film {...props} />;
  }
}

function ImagePreview({ url }: { url: string }) {
  const [imgState, setImgState] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    if (!url) return;
    setImgState("loading");
  }, [url]);

  if (!url) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]" style={{ minHeight: 80 }}>
      {imgState === "loading" && (
        <div className="flex h-20 items-center justify-center">
          <Loader2 size={16} className="animate-spin text-slate-600" />
        </div>
      )}
      {imgState === "error" && (
        <div className="flex h-20 flex-col items-center justify-center gap-1.5">
          <X size={16} className="text-rose-400/60" />
          <span className="text-[10px] text-slate-600">Cannot load image</span>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Preview"
        className={`w-full object-cover transition-opacity duration-200 ${imgState === "loaded" ? "opacity-100" : "opacity-0 h-0"}`}
        style={{ maxHeight: 160 }}
        onLoad={() => setImgState("loaded")}
        onError={() => setImgState("error")}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    </div>
  );
}

function VideoPreview({ url }: { url: string }) {
  const [vidState, setVidState] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    if (!url) return;
    setVidState("loading");
  }, [url]);

  if (!url) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]" style={{ minHeight: 80 }}>
      {vidState === "loading" && (
        <div className="flex h-20 items-center justify-center">
          <Loader2 size={16} className="animate-spin text-slate-600" />
        </div>
      )}
      {vidState === "error" && (
        <div className="flex h-20 flex-col items-center justify-center gap-1.5">
          <X size={16} className="text-rose-400/60" />
          <span className="text-[10px] text-slate-600">Cannot load video — try a different URL</span>
        </div>
      )}
      <video
        src={url}
        className={`w-full object-cover transition-opacity duration-200 ${vidState === "loaded" ? "opacity-100" : "opacity-0 h-0"}`}
        style={{ maxHeight: 160 }}
        muted
        playsInline
        controls
        preload="metadata"
        onLoadedMetadata={() => setVidState("loaded")}
        onError={() => setVidState("error")}
      />
    </div>
  );
}

export function WorkflowNode({ id, data, selected }: NodeProps<WorkflowNodeType>) {
  const updateNodeData = useBuilderStore((s) => s.updateNodeData);
  const status = getExecStatus(data);

  return (
    <div
      style={{
        ...nodeBoxStyle(status, selected ?? false),
        width: 300,
        borderRadius: 20,
        background: selected ? "#0d1320" : "#0d1118",
        transition: "border 0.2s ease, box-shadow 0.3s ease",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {status === "running" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-100%",
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent 0%, #facc15 50%, transparent 100%)",
            animation: "shimmer 1.4s linear infinite",
            width: "300%"
          }}
        />
      )}

      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors ${nodeIconClass(status)}`}>
          <NodeIcon kind={data.kind} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold leading-none text-slate-100">{data.title}</div>
          <div className="mt-1 truncate text-[11px] leading-none text-slate-500">{data.subtitle}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="p-3">
        {renderBody(id, data, updateNodeData)}
      </div>

      {data.kind === "text" && (
        <Handle id="text" type="source" position={Position.Right} style={handleStyle} />
      )}
      {data.kind === "uploadImage" && (
        <Handle id="image" type="source" position={Position.Right} style={handleStyleAccent} />
      )}
      {data.kind === "uploadVideo" && (
        <Handle id="video" type="source" position={Position.Right} style={handleStyle} />
      )}
      {data.kind === "cropImage" && (
        <>
          <Handle id="image" type="target" position={Position.Left}  style={handleStyleAccent} />
          <Handle id="image" type="source" position={Position.Right} style={handleStyleAccent} />
        </>
      )}
      {data.kind === "extractFrame" && (
        <>
          <Handle id="video" type="target" position={Position.Left}  style={handleStyle} />
          <Handle id="image" type="source" position={Position.Right} style={handleStyleAccent} />
        </>
      )}
      {data.kind === "runAnyLLM" && (
        <>
          <Handle id="system_prompt" type="target" position={Position.Left} style={{ ...handleStyle,       top: "30%" }} />
          <Handle id="user_message"  type="target" position={Position.Left} style={{ ...handleStyle,       top: "50%" }} />
          <Handle id="images"        type="target" position={Position.Left} style={{ ...handleStyleAccent, top: "70%" }} />
          <Handle id="text"          type="source" position={Position.Right} style={handleStyle} />
        </>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[13px] text-slate-100 outline-none placeholder:text-slate-600 focus:border-white/[0.14] focus:bg-white/[0.05] transition-colors";
const textareaClass = `${inputClass} resize-none leading-relaxed`;
const labelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 mb-1.5";

function RunningBanner({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3 text-center">
      <div className="flex items-center justify-center gap-2 text-[12px] text-amber-300">
        <Loader2 size={12} className="animate-spin" />
        {label}
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-rose-400">
        <AlertCircle size={11} /> Error
      </div>
      <p className="text-[11px] text-rose-300/80">{message ?? "Execution failed"}</p>
    </div>
  );
}

function renderBody(
  id: string,
  data: WorkflowNodeData,
  updateNodeData: (nodeId: string, updater: (d: WorkflowNodeData) => WorkflowNodeData) => void
) {
  if (data.kind === "text") {
    return (
      <div className="space-y-2.5">
        <div>
          <label className={labelClass}>Role</label>
          <select
            suppressHydrationWarning
            className={inputClass}
            value={data.role}
            onChange={(e) =>
              updateNodeData(id, (d) =>
                d.kind === "text" ? { ...d, role: e.target.value as typeof d.role } : d
              )
            }
          >
            <option value="system_prompt">System Prompt</option>
            <option value="user_message">User Message</option>
            <option value="text">Text</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Content</label>
          <textarea
            suppressHydrationWarning
            className={`${textareaClass} min-h-[90px]`}
            value={data.text}
            placeholder="Enter text content..."
            onChange={(e) =>
              updateNodeData(id, (d) =>
                d.kind === "text" ? { ...d, text: e.target.value } : d
              )
            }
          />
        </div>
      </div>
    );
  }

  if (data.kind === "uploadImage") {
    const activeUrl = data.url || data.imageUrl;
    return (
      <div className="space-y-2.5">
        <div>
          <label className={labelClass}>Image URL</label>
          <input
            suppressHydrationWarning
            className={inputClass}
            value={data.url}
            placeholder="https://example.com/image.jpg"
            onChange={(e) =>
              updateNodeData(id, (d) =>
                d.kind === "uploadImage"
                  ? { ...d, url: e.target.value, imageUrl: e.target.value, preview: e.target.value, status: e.target.value ? "done" : "idle" }
                  : d
              )
            }
          />
        </div>
        {activeUrl && <ImagePreview url={activeUrl} />}
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${activeUrl ? "bg-emerald-400" : "bg-slate-600"}`} />
          <span className="truncate text-[11px] text-slate-500">
            {activeUrl ? activeUrl.split("/").pop()?.slice(0, 40) || "Image loaded" : "Paste an image URL above"}
          </span>
        </div>
      </div>
    );
  }

  if (data.kind === "uploadVideo") {
    const activeUrl = data.url || data.videoUrl;
    return (
      <div className="space-y-2.5">
        <div>
          <label className={labelClass}>Video URL</label>
          <input
            suppressHydrationWarning
            className={inputClass}
            value={data.url}
            placeholder="https://example.com/video.mp4"
            onChange={(e) =>
              updateNodeData(id, (d) =>
                d.kind === "uploadVideo"
                  ? { ...d, url: e.target.value, videoUrl: e.target.value, preview: e.target.value, status: e.target.value ? "done" : "idle" }
                  : d
              )
            }
          />
        </div>
        {activeUrl && <VideoPreview url={activeUrl} />}
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${activeUrl ? "bg-emerald-400" : "bg-slate-600"}`} />
          <span className="truncate text-[11px] text-slate-500">
            {activeUrl ? activeUrl.split("/").pop()?.slice(0, 40) || "Video loaded" : "Paste a video URL above"}
          </span>
        </div>
      </div>
    );
  }

  if (data.kind === "runAnyLLM") {
    return (
      <div className="space-y-2.5">
        <div>
          <label className={labelClass}>Model</label>
          <select
            suppressHydrationWarning
            className={inputClass}
            value={data.model}
            onChange={(e) =>
              updateNodeData(id, (d) =>
                d.kind === "runAnyLLM" ? { ...d, model: e.target.value } : d
              )
            }
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>System Prompt <span className="normal-case text-slate-700">(optional)</span></label>
          <textarea
            suppressHydrationWarning
            className={`${textareaClass} min-h-[56px]`}
            value={data.systemPrompt}
            placeholder="You are a helpful assistant..."
            onChange={(e) =>
              updateNodeData(id, (d) =>
                d.kind === "runAnyLLM" ? { ...d, systemPrompt: e.target.value } : d
              )
            }
          />
        </div>
        <div>
          <label className={labelClass}>User Message</label>
          <textarea
            suppressHydrationWarning
            className={`${textareaClass} min-h-[70px]`}
            value={data.userMessage}
            placeholder="Enter your prompt..."
            onChange={(e) =>
              updateNodeData(id, (d) =>
                d.kind === "runAnyLLM" ? { ...d, userMessage: e.target.value } : d
              )
            }
          />
        </div>

        {data.status === "running" && <RunningBanner label="Generating response…" />}
        {data.status === "error"   && <ErrorBanner message={data.error} />}

        {data.output && data.status === "success" && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={11} className="text-emerald-400" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">Output</span>
            </div>
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[12px] leading-relaxed text-slate-200">
              {data.output}
            </p>
          </div>
        )}

        {data.status === "idle" && !data.output && (
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
            <p className="text-[11px] text-slate-600">Run workflow to see output</p>
          </div>
        )}

        <div className="space-y-1">
          {[
            { label: "system_prompt", color: "bg-slate-500" },
            { label: "user_message",  color: "bg-slate-500" },
            { label: "images",        color: "bg-cyan-500" }
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${color} opacity-50`} />
              <span className="text-[10px] text-slate-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.kind === "cropImage") {
    return (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {(["x", "y", "width", "height"] as const).map((key) => (
            <div key={key}>
              <label className={labelClass}>
                {key === "x" ? "X %" : key === "y" ? "Y %" : key === "width" ? "W %" : "H %"}
              </label>
              <input
                suppressHydrationWarning
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={data[key]}
                onChange={(e) =>
                  updateNodeData(id, (d) =>
                    d.kind === "cropImage" ? { ...d, [key]: Number(e.target.value) } : d
                  )
                }
              />
            </div>
          ))}
        </div>
        {data.status === "running" && <RunningBanner label="Processing crop…" />}
        {data.status === "error"   && <ErrorBanner message="Crop operation failed" />}
        {data.output && data.status === "success" && (
          <>
            <ImagePreview url={data.output} />
            <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-2.5">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">Output URL</div>
              <p className="break-all text-[11px] text-slate-300">{data.output}</p>
            </div>
          </>
        )}
      </div>
    );
  }

  if (data.kind === "extractFrame") {
    return (
      <div className="space-y-2.5">
        <div>
          <label className={labelClass}>Timestamp (seconds)</label>
          <input
            suppressHydrationWarning
            type="number"
            min={0}
            step={0.1}
            className={inputClass}
            value={data.timestamp}
            onChange={(e) =>
              updateNodeData(id, (d) =>
                d.kind === "extractFrame" ? { ...d, timestamp: Number(e.target.value) } : d
              )
            }
          />
        </div>
        {data.status === "running" && <RunningBanner label="Extracting frame…" />}
        {data.status === "error"   && <ErrorBanner message="Frame extraction failed" />}
        {data.output && data.status === "success" && (
          <>
            <ImagePreview url={data.output} />
            <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-2.5">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">Output URL</div>
              <p className="break-all text-[11px] text-slate-300">{data.output}</p>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}
