export type WorkflowRunStatus = "queued" | "running" | "success" | "failed";
export type WorkflowRunScope = "full" | "partial" | "node";

export type WorkflowNodeType =
  | "text"
  | "uploadImage"
  | "uploadVideo"
  | "runAnyLLM"
  | "cropImage"
  | "extractFrame";

export type WorkflowNodeData =
  | {
      kind: "text";
      title: string;
      subtitle: string;
      role: "system_prompt" | "user_message" | "text";
      text: string;
      label?: string;
    }
  | {
      kind: "uploadImage";
      title: string;
      subtitle: string;
      imageUrl: string;
      preview: string;
      status: "idle" | "uploading" | "done" | "error";
      url: string;
      fileName: string;
      mimeType: string;
    }
  | {
      kind: "uploadVideo";
      title: string;
      subtitle: string;
      videoUrl: string;
      preview: string;
      status: "idle" | "uploading" | "done" | "error";
      url: string;
      fileName: string;
      mimeType: string;
    }
  | {
      kind: "runAnyLLM";
      title: string;
      subtitle: string;
      model: string;
      systemPrompt: string;
      userMessage: string;
      images: string[];
      output: string;
      status: "idle" | "running" | "success" | "error";
      error?: string;
    }
  | {
      kind: "cropImage";
      title: string;
      subtitle: string;
      imageUrl: string;
      x: number;
      y: number;
      width: number;
      height: number;
      output: string;
      status: "idle" | "running" | "success" | "error";
    }
  | {
      kind: "extractFrame";
      title: string;
      subtitle: string;
      videoUrl: string;
      timestamp: number;
      output: string;
      status: "idle" | "running" | "success" | "error";
    };

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
};

export type WorkflowHandleKey =
  | "text"
  | "image"
  | "video"
  | "system_prompt"
  | "user_message"
  | "images";

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  type?: string;
  animated?: boolean;
  markerEnd?: unknown;
  style?: Record<string, unknown>;
};

export type WorkflowDefinition = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type NodeExecutionRecord = {
  id: string;
  nodeId: string;
  nodeType: WorkflowNodeType;
  status: "success" | "failed";
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown> | null;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  error: string | null;
};

export type WorkflowRunRecord = {
  id: string;
  workflowId: string;
  status: WorkflowRunStatus;
  scope: WorkflowRunScope;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  selectedNodeIds: string[];
  summary: {
    completedNodes: number;
    failedNodes: number;
    error?: string | null;
  } | null;
  nodeRuns: NodeExecutionRecord[];
};

export type WorkflowRecord = {
  id: string;
  clerkUserId: string;
  name: string;
  definition: WorkflowDefinition;
  viewport: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  runs: WorkflowRunRecord[];
};
