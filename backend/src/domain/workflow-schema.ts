import { z } from "zod";

const workflowNodeDataSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("text"),
    title: z.string(),
    subtitle: z.string(),
    role: z.enum(["system_prompt", "user_message", "text"]),
    text: z.string(),
    label: z.string().optional()
  }),
  z.object({
    kind: z.literal("uploadImage"),
    title: z.string(),
    subtitle: z.string(),
    imageUrl: z.string(),
    preview: z.string(),
    status: z.enum(["idle", "uploading", "done", "error"]),
    url: z.string(),
    fileName: z.string(),
    mimeType: z.string()
  }),
  z.object({
    kind: z.literal("uploadVideo"),
    title: z.string(),
    subtitle: z.string(),
    videoUrl: z.string(),
    preview: z.string(),
    status: z.enum(["idle", "uploading", "done", "error"]),
    url: z.string(),
    fileName: z.string(),
    mimeType: z.string()
  }),
  z.object({
    kind: z.literal("runAnyLLM"),
    title: z.string(),
    subtitle: z.string(),
    model: z.string(),
    systemPrompt: z.string(),
    userMessage: z.string(),
    images: z.array(z.string()),
    output: z.string(),
    status: z.enum(["idle", "running", "success", "error"]),
    error: z.string().optional()
  }),
  z.object({
    kind: z.literal("cropImage"),
    title: z.string(),
    subtitle: z.string(),
    imageUrl: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    output: z.string(),
    status: z.enum(["idle", "running", "success", "error"])
  }),
  z.object({
    kind: z.literal("extractFrame"),
    title: z.string(),
    subtitle: z.string(),
    videoUrl: z.string(),
    timestamp: z.number(),
    output: z.string(),
    status: z.enum(["idle", "running", "success", "error"])
  })
]);

const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "uploadImage", "uploadVideo", "runAnyLLM", "cropImage", "extractFrame"]),
  position: z.object({ x: z.number(), y: z.number() }),
  data: workflowNodeDataSchema
});

const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string(),
  targetHandle: z.string(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
  markerEnd: z.unknown().optional(),
  style: z.record(z.unknown()).optional()
});

const workflowDefinitionSchema = z.object({
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema)
});

export const saveWorkflowSchema = z.object({
  clerkUserId: z.string(),
  name: z.string().default("Untitled Workflow"),
  definition: workflowDefinitionSchema,
  viewport: z.record(z.unknown()).nullable().optional()
});

export const runWorkflowSchema = z.object({
  clerkUserId: z.string(),
  name: z.string().default("Untitled Workflow"),
  definition: workflowDefinitionSchema,
  scope: z.enum(["full", "partial", "node"]).default("full"),
  selectedNodeIds: z.array(z.string()).default([])
});

export type SaveWorkflowInput = z.infer<typeof saveWorkflowSchema>;
export type RunWorkflowInput = z.infer<typeof runWorkflowSchema>;
