import { MarkerType, type Connection } from "@xyflow/react";

import type { WorkflowEdge, WorkflowHandleKey, WorkflowNode, WorkflowNodeType } from "@/types/workflow";

const sourceOutputTypes: Record<WorkflowNodeType, ("text" | "image" | "video")[]> = {
  text: ["text"],
  uploadImage: ["image"],
  uploadVideo: ["video"],
  runAnyLLM: ["text"],
  cropImage: ["image"],
  extractFrame: ["image"]
};

const targetInputTypes: Record<WorkflowNodeType, Partial<Record<WorkflowHandleKey, "text" | "image" | "video">>> = {
  text: {},
  uploadImage: {},
  uploadVideo: {},
  runAnyLLM: { system_prompt: "text", user_message: "text", images: "image" },
  cropImage: { image: "image" },
  extractFrame: { video: "video" }
};

export function buildNode(type: WorkflowNodeType, input: { id: string; position: { x: number; y: number } }): WorkflowNode {
  switch (type) {
    case "text":
      return {
        id: input.id, type,
        position: input.position,
        data: { kind: "text", label: "Text Node", title: "Text Node", subtitle: "Prompt or content", role: "text", text: "" }
      };
    case "uploadImage":
      return {
        id: input.id, type,
        position: input.position,
        data: { kind: "uploadImage", title: "Upload Image", subtitle: "Image source", imageUrl: "", preview: "", status: "idle", url: "", fileName: "", mimeType: "image/jpeg" }
      };
    case "uploadVideo":
      return {
        id: input.id, type,
        position: input.position,
        data: { kind: "uploadVideo", title: "Upload Video", subtitle: "Video source", videoUrl: "", preview: "", status: "idle", url: "", fileName: "", mimeType: "video/mp4" }
      };
    case "runAnyLLM":
      return {
        id: input.id, type,
        position: input.position,
        data: { kind: "runAnyLLM", title: "Run Any LLM", subtitle: "Gemini execution", model: "gemini-2.5-flash", systemPrompt: "", userMessage: "", images: [], output: "", status: "idle" }
      };
    case "cropImage":
      return {
        id: input.id, type,
        position: input.position,
        data: { kind: "cropImage", title: "Crop Image", subtitle: "FFmpeg crop", imageUrl: "", x: 0, y: 0, width: 100, height: 100, output: "", status: "idle" }
      };
    case "extractFrame":
      return {
        id: input.id, type,
        position: input.position,
        data: { kind: "extractFrame", title: "Extract Frame", subtitle: "Video to image", videoUrl: "", timestamp: 0, output: "", status: "idle" }
      };
  }
}

export function makeEdge(
  source: string,
  target: string,
  sourceHandle: WorkflowHandleKey,
  targetHandle: WorkflowHandleKey
): WorkflowEdge {
  return {
    id: `edge-${source}-${target}-${sourceHandle}-${targetHandle}`,
    source, target, sourceHandle, targetHandle,
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#475569" },
    style: { stroke: "#334155", strokeWidth: 1.5 }
  };
}

export function buildSampleWorkflow(): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  const nodes: WorkflowNode[] = [
    {
      ...buildNode("uploadImage", { id: "upload-image", position: { x: 60, y: 100 } }),
      data: {
        kind: "uploadImage", title: "Upload Image", subtitle: "Product image source",
        imageUrl: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=800&q=80",
        preview: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=800&q=80",
        status: "done",
        url: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=800&q=80",
        fileName: "product-shot.jpg", mimeType: "image/jpeg"
      }
    },
    {
      ...buildNode("cropImage", { id: "crop-image", position: { x: 420, y: 100 } }),
      data: { kind: "cropImage", title: "Crop Image", subtitle: "FFmpeg crop", imageUrl: "", x: 8, y: 14, width: 72, height: 62, output: "", status: "idle" }
    },
    {
      ...buildNode("text", { id: "system-prompt", position: { x: 60, y: 360 } }),
      data: { kind: "text", title: "System Prompt", subtitle: "LLM system context", role: "system_prompt", text: "You are a product marketing strategist. Write polished, high-conversion launch copy.", label: "System Prompt" }
    },
    {
      ...buildNode("text", { id: "product-details", position: { x: 60, y: 560 } }),
      data: { kind: "text", title: "Product Details", subtitle: "User message input", role: "user_message", text: "Product: Orbit Desk Lamp. Features: portable, magnetic base, cinematic glow, 12-hour battery.", label: "Product Details" }
    },
    {
      ...buildNode("runAnyLLM", { id: "description-llm", position: { x: 720, y: 320 } }),
      data: { kind: "runAnyLLM", title: "LLM Product Description", subtitle: "Gemini execution", model: "gemini-2.5-flash", systemPrompt: "", userMessage: "Summarize the image and product details into launch-ready product copy.", images: [], output: "", status: "idle" }
    },
    {
      ...buildNode("uploadVideo", { id: "upload-video", position: { x: 60, y: 780 } }),
      data: {
        kind: "uploadVideo", title: "Upload Video", subtitle: "Product demo video",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        preview: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        status: "done",
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        fileName: "product-demo.mp4", mimeType: "video/mp4"
      }
    },
    {
      ...buildNode("extractFrame", { id: "extract-frame", position: { x: 420, y: 780 } }),
      data: { kind: "extractFrame", title: "Extract Frame", subtitle: "Video to image", videoUrl: "", timestamp: 3.2, output: "", status: "idle" }
    },
    {
      ...buildNode("runAnyLLM", { id: "final-post", position: { x: 1080, y: 560 } }),
      data: { kind: "runAnyLLM", title: "Final Marketing Post", subtitle: "Convergence LLM", model: "gemini-2.5-flash", systemPrompt: "You are a social media marketing expert.", userMessage: "Combine the product description, cropped image context, and extracted frame into one punchy social media post.", images: [], output: "", status: "idle" }
    }
  ];

  const edges: WorkflowEdge[] = [
    makeEdge("upload-image", "crop-image", "image", "image"),
    makeEdge("system-prompt", "description-llm", "text", "system_prompt"),
    makeEdge("product-details", "description-llm", "text", "user_message"),
    makeEdge("crop-image", "description-llm", "image", "images"),
    makeEdge("upload-video", "extract-frame", "video", "video"),
    makeEdge("description-llm", "final-post", "text", "user_message"),
    makeEdge("extract-frame", "final-post", "image", "images"),
    makeEdge("crop-image", "final-post", "image", "images")
  ];

  return { nodes, edges };
}

export function canConnect(connection: Connection, nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) return false;
  if (connection.source === connection.target) return false;

  const source = nodes.find((n) => n.id === connection.source);
  const target = nodes.find((n) => n.id === connection.target);
  if (!source || !target) return false;

  const sourceType = source.type as WorkflowNodeType;
  const targetType = target.type as WorkflowNodeType;

  const expected = targetInputTypes[targetType][connection.targetHandle as WorkflowHandleKey];
  if (!expected) return false;

  const compatible = sourceOutputTypes[sourceType].includes(expected);
  if (!compatible) return false;

  const candidateEdge = makeEdge(connection.source, connection.target, connection.sourceHandle as WorkflowHandleKey, connection.targetHandle as WorkflowHandleKey);
  return !introducesCycle(nodes, [...edges, candidateEdge]);
}

function introducesCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  const queue = [...indegree.entries()].filter(([, c]) => c === 0).map(([id]) => id);
  let visited = 0;

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    visited += 1;
    for (const next of adjacency.get(nodeId) ?? []) {
      const nextCount = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextCount);
      if (nextCount === 0) queue.push(next);
    }
  }

  return visited !== nodes.length;
}
