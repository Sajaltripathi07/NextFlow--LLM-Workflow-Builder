"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

import { WorkflowNode } from "@/components/builder/workflow-node";
import { useBuilderStore } from "@/stores/use-builder-store";
import type { WorkflowNodeType } from "@/types/workflow";

const nodeTypes = {
  text: WorkflowNode,
  uploadImage: WorkflowNode,
  uploadVideo: WorkflowNode,
  runAnyLLM: WorkflowNode,
  cropImage: WorkflowNode,
  extractFrame: WorkflowNode
};

const workflowNodeTypes: WorkflowNodeType[] = [
  "text",
  "uploadImage",
  "uploadVideo",
  "runAnyLLM",
  "cropImage",
  "extractFrame"
];

function isWorkflowNodeType(value: string): value is WorkflowNodeType {
  return workflowNodeTypes.includes(value as WorkflowNodeType);
}

export function CanvasShell() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

function CanvasInner() {
  const nodes = useBuilderStore((s) => s.nodes);
  const edges = useBuilderStore((s) => s.edges);
  const dragType = useBuilderStore((s) => s.dragType);
  const initialize = useBuilderStore((s) => s.initialize);
  const addNode = useBuilderStore((s) => s.addNode);
  const setDragType = useBuilderStore((s) => s.setDragType);
  const onNodesChange = useBuilderStore((s) => s.onNodesChange);
  const onEdgesChange = useBuilderStore((s) => s.onEdgesChange);
  const onConnect = useBuilderStore((s) => s.onConnect);
  const onSelectionChange = useBuilderStore((s) => s.onSelectionChange);
  const deleteSelection = useBuilderStore((s) => s.deleteSelection);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const reactFlow = useReactFlow();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelection();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelection, undo, redo]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/nextflow-node") || dragType;
      if (!type || !isWorkflowNodeType(type)) return;
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });
      addNode(type, position);
      setDragType(null);
    },
    [dragType, reactFlow, addNode, setDragType]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="relative h-full min-h-[700px] w-full overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#07090e]">
      <ReactFlow
        className="h-full w-full"
        fitView
        fitViewOptions={{ padding: 0.18 }}
        colorMode="dark"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={null}
        onConnect={(connection) => {
          const valid = onConnect(connection);
          if (!valid) {
            toast.error("Invalid connection — type mismatch or cycle detected.");
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onSelectionChange={({ nodes: sel }) =>
          onSelectionChange(sel.map((n) => n.id))
        }
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="rgba(255,255,255,0.04)"
          gap={26}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <MiniMap
          className="!bottom-4 !right-4 !rounded-[14px] !border !border-white/[0.07] !bg-[#0d1118] overflow-hidden"
          maskColor="rgba(7,9,14,0.7)"
          nodeColor="#1e293b"
          nodeBorderRadius={8}
          pannable
          zoomable
        />
        <Controls
          className="!bottom-4 !left-4 !rounded-[14px] !border !border-white/[0.07] !bg-[#0d1118] overflow-hidden"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}
