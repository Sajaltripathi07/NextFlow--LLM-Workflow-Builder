"use client";

import { addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange, type XYPosition } from "@xyflow/react";
import { create } from "zustand";

import { runWorkflowRequest, saveWorkflowRequest } from "@/lib/api";
import { buildNode, buildSampleWorkflow, canConnect, makeEdge } from "@/lib/workflow-graph";
import type { WorkflowEdge, WorkflowNode, WorkflowNodeData, WorkflowNodeType, WorkflowRecord, WorkflowRunRecord, WorkflowHandleKey } from "@/types/workflow";

type Snapshot = { nodes: WorkflowNode[]; edges: WorkflowEdge[] };

export type NodeExecutionState = {
  status: "idle" | "running" | "success" | "error";
  output?: unknown;
  error?: string;
  startedAt?: number;
  completedAt?: number;
};

type BuilderState = {
  workflowId: string | null;
  workflowName: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  runs: WorkflowRunRecord[];
  nodeExecutions: Record<string, Record<string, NodeExecutionState>>;
  selectedNodeIds: string[];
  past: Snapshot[];
  future: Snapshot[];
  isSaving: boolean;
  isRunning: boolean;
  dragType: WorkflowNodeType | null;
  initialize: () => void;
  setWorkflowName: (name: string) => void;
  setDragType: (type: WorkflowNodeType | null) => void;
  addNode: (type: WorkflowNodeType, position: XYPosition) => void;
  updateNodeData: (nodeId: string, updater: (data: WorkflowNodeData) => WorkflowNodeData) => void;
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;
  onSelectionChange: (nodeIds: string[]) => void;
  onConnect: (connection: Connection) => boolean;
  deleteSelection: () => void;
  undo: () => void;
  redo: () => void;
  saveWorkflow: (userId: string) => Promise<void>;
  runWorkflow: (userId: string, scope: "full" | "partial" | "node") => Promise<void>;
};

function clone(nodes: WorkflowNode[], edges: WorkflowEdge[]): Snapshot {
  return { nodes: structuredClone(nodes), edges: structuredClone(edges) };
}

function mapStatus(status: WorkflowRunRecord["status"]): NodeExecutionState["status"] {
  if (status === "failed") return "error";
  if (status === "queued") return "idle";
  return status;
}

function buildExecutions(runs: WorkflowRunRecord[]): Record<string, Record<string, NodeExecutionState>> {
  return Object.fromEntries(
    runs.map((run) => [
      run.id,
      Object.fromEntries(
        run.nodeRuns.map((nr) => [
          nr.nodeId,
          {
            status: mapStatus(nr.status),
            output: nr.outputs ?? undefined,
            error: nr.error ?? undefined,
            startedAt: Date.parse(nr.startedAt),
            completedAt: nr.completedAt ? Date.parse(nr.completedAt) : undefined
          } satisfies NodeExecutionState
        ])
      )
    ])
  );
}

const sample = buildSampleWorkflow();

export const useBuilderStore = create<BuilderState>((set, get) => ({
  workflowId: null,
  workflowName: "Product Marketing Generator",
  nodes: sample.nodes,
  edges: sample.edges,
  runs: [],
  nodeExecutions: {},
  selectedNodeIds: [],
  past: [],
  future: [],
  isSaving: false,
  isRunning: false,
  dragType: null,

  initialize: () => {
    const state = get();
    if (state.nodes.length === 0) {
      const seeded = buildSampleWorkflow();
      set({ nodes: seeded.nodes, edges: seeded.edges });
    }
  },

  setWorkflowName: (name) => set({ workflowName: name }),
  setDragType: (type) => set({ dragType: type }),

  addNode: (type, position) => {
    const state = get();
    const snapshot = clone(state.nodes, state.edges);
    const node = buildNode(type, { id: `${type}-${crypto.randomUUID()}`, position });
    set({ nodes: [...state.nodes, node], past: [...state.past, snapshot], future: [] });
  },

  updateNodeData: (nodeId, updater) => {
    const state = get();
    const snapshot = clone(state.nodes, state.edges);
    set({
      nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, data: updater(n.data) } : n),
      past: [...state.past, snapshot],
      future: []
    });
  },

  onNodesChange: (changes) => {
    const state = get();
    const structural = changes.some((c) => c.type !== "select");
    const snapshot = structural ? clone(state.nodes, state.edges) : null;
    const nodes = applyNodeChanges(changes, state.nodes) as WorkflowNode[];
    set({ nodes, past: snapshot ? [...state.past, snapshot] : state.past, future: snapshot ? [] : state.future });
  },

  onEdgesChange: (changes) => {
    const state = get();
    const structural = changes.some((c) => c.type !== "select");
    const snapshot = structural ? clone(state.nodes, state.edges) : null;
    const edges = applyEdgeChanges(changes, state.edges) as WorkflowEdge[];
    set({ edges, past: snapshot ? [...state.past, snapshot] : state.past, future: snapshot ? [] : state.future });
  },

  onSelectionChange: (nodeIds) => set({ selectedNodeIds: nodeIds }),

  onConnect: (connection) => {
    const state = get();
    if (!canConnect(connection, state.nodes, state.edges)) return false;
    const snapshot = clone(state.nodes, state.edges);
    const edge = makeEdge(
      connection.source!,
      connection.target!,
      connection.sourceHandle as WorkflowHandleKey,
      connection.targetHandle as WorkflowHandleKey
    );
    set({ edges: addEdge(edge, state.edges) as WorkflowEdge[], past: [...state.past, snapshot], future: [] });
    return true;
  },

  deleteSelection: () => {
    const state = get();
    if (state.selectedNodeIds.length === 0) return;
    const snapshot = clone(state.nodes, state.edges);
    const selected = new Set(state.selectedNodeIds);
    set({
      nodes: state.nodes.filter((n) => !selected.has(n.id)),
      edges: state.edges.filter((e) => !selected.has(e.source) && !selected.has(e.target)),
      selectedNodeIds: [],
      past: [...state.past, snapshot],
      future: []
    });
  },

  undo: () => {
    const state = get();
    const previous = state.past.at(-1);
    if (!previous) return;
    const current = clone(state.nodes, state.edges);
    set({ nodes: previous.nodes, edges: previous.edges, past: state.past.slice(0, -1), future: [current, ...state.future] });
  },

  redo: () => {
    const state = get();
    const next = state.future.at(0);
    if (!next) return;
    const current = clone(state.nodes, state.edges);
    set({ nodes: next.nodes, edges: next.edges, past: [...state.past, current], future: state.future.slice(1) });
  },

  saveWorkflow: async (userId) => {
    const state = get();
    set({ isSaving: true });
    try {
      const workflow = await saveWorkflowRequest({
        clerkUserId: userId,
        name: state.workflowName,
        definition: { nodes: state.nodes, edges: state.edges }
      });
      set({ workflowId: workflow.id, runs: workflow.runs, nodeExecutions: buildExecutions(workflow.runs), isSaving: false });
    } catch (error) {
      set({ isSaving: false });
      throw error;
    }
  },

  runWorkflow: async (userId, scope) => {
    const state = get();
    set({ isRunning: true });
    try {
      const result = await runWorkflowRequest({
        clerkUserId: userId,
        name: state.workflowName,
        definition: { nodes: state.nodes, edges: state.edges },
        scope,
        selectedNodeIds: scope === "full" ? [] : state.selectedNodeIds
      });

      const latestRun = result.latestRun;
      const outputByNodeId = new Map((latestRun?.nodeRuns ?? []).map((r) => [r.nodeId, r.outputs]));

      const nodes: WorkflowNode[] = state.nodes.map((node) => {
        const outputs = outputByNodeId.get(node.id);
        if (!outputs) return node;

        if (node.data.kind === "runAnyLLM") {
          return { ...node, data: { ...node.data, output: String(outputs.text ?? outputs.value ?? ""), status: "success" as const, error: undefined } };
        }
        if (node.data.kind === "cropImage" || node.data.kind === "extractFrame") {
          return { ...node, data: { ...node.data, output: String(outputs.image ?? outputs.value ?? ""), status: "success" as const } };
        }
        return node;
      });

      set({
        workflowId: result.workflow.id,
        runs: result.workflow.runs,
        nodeExecutions: buildExecutions(result.workflow.runs),
        nodes,
        isRunning: false
      });
    } catch (error) {
      set({ isRunning: false });
      throw error;
    }
  }
}));
