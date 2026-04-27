"use client";

import { ImageIcon, MessageSquare, Scissors, Search, Type, VideoIcon, WandSparkles } from "lucide-react";
import { useState } from "react";

import { useBuilderStore } from "@/stores/use-builder-store";
import type { NodeLibraryItem, WorkflowNodeType } from "@/types/workflow";

const items: NodeLibraryItem[] = [
  { type: "text",         title: "Text Node",     subtitle: "Prompt or content input" },
  { type: "uploadImage",  title: "Upload Image",   subtitle: "Image URL with preview" },
  { type: "uploadVideo",  title: "Upload Video",   subtitle: "Video URL with preview" },
  { type: "runAnyLLM",   title: "Run Any LLM",    subtitle: "Gemini AI execution" },
  { type: "cropImage",   title: "Crop Image",      subtitle: "FFmpeg image crop" },
  { type: "extractFrame",title: "Extract Frame",   subtitle: "Video frame extraction" }
];

const icons: Record<WorkflowNodeType, React.ElementType> = {
  text:         Type,
  uploadImage:  ImageIcon,
  uploadVideo:  VideoIcon,
  runAnyLLM:   WandSparkles,
  cropImage:   Scissors,
  extractFrame: MessageSquare
};

const iconColors: Record<WorkflowNodeType, string> = {
  text:         "text-violet-300 bg-violet-400/10",
  uploadImage:  "text-blue-300 bg-blue-400/10",
  uploadVideo:  "text-orange-300 bg-orange-400/10",
  runAnyLLM:   "text-cyan-300 bg-cyan-400/10",
  cropImage:   "text-emerald-300 bg-emerald-400/10",
  extractFrame: "text-amber-300 bg-amber-400/10"
};

export function NodeLibrary() {
  const setDragType = useBuilderStore((s) => s.setDragType);
  const addNode     = useBuilderStore((s) => s.addNode);
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#0d1118]">
      <div className="border-b border-white/[0.06] px-4 py-4">
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">NextFlow</div>
        <div className="text-[15px] font-semibold text-slate-100">Node Library</div>
      </div>

      <div className="border-b border-white/[0.06] px-3 py-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            suppressHydrationWarning
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 pl-8 pr-3 text-[13px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-white/[0.12] transition-colors"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">Quick Access</div>
        <div className="space-y-1.5">
          {filtered.map((item) => {
            const Icon       = icons[item.type];
            const colorClass = iconColors[item.type];
            return (
              <button
                key={item.type}
                suppressHydrationWarning
                type="button"
                className="group flex w-full cursor-grab items-center gap-3 rounded-[14px] border border-transparent px-3 py-2.5 text-left transition-all hover:border-white/[0.08] hover:bg-white/[0.04] active:cursor-grabbing active:scale-[0.98]"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/nextflow-node", item.type);
                  e.dataTransfer.effectAllowed = "move";
                  setDragType(item.type);
                }}
                onDragEnd={() => setDragType(null)}
                onClick={() => {
                  addNode(item.type, { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 });
                }}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${colorClass} transition-all group-hover:scale-105`}>
                  <Icon size={14} strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-[13px] font-medium text-slate-200">{item.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-none text-slate-600">{item.subtitle}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-4 py-3">
        <p className="text-[11px] text-slate-700">Drag to canvas or click to add at centre</p>
      </div>
    </aside>
  );
}
