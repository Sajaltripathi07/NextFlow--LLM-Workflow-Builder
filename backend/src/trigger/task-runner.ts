import type { WorkflowNode, WorkflowNodeData } from "../domain/workflow-types.js";

import type {
  LlmTaskPayload,
  CropImageTaskPayload,
  ExtractFrameTaskPayload
} from "./task-types.js";

import { runLlm } from "./llm-task.js";
import { runCropImage } from "./crop-task.js";
import { runExtractFrame } from "./extract-frame-task.js";

type NodeOutput = Record<string, unknown>;

export async function runNodeViaTrigger(
  node: WorkflowNode,
  inputs: NodeOutput
): Promise<NodeOutput> {
  const data = node.data;

  switch (data.kind) {
    case "text":
      return { value: data.text, text: data.text };

    case "uploadImage":
      return { value: data.url, image: data.url };

    case "uploadVideo":
      return { value: data.url, video: data.url };

    case "runAnyLLM":
      return dispatchLlm(node.id, data, inputs);

    case "cropImage":
      return dispatchCrop(node.id, data, inputs);

    case "extractFrame":
      return dispatchExtractFrame(node.id, data, inputs);
  }
}


async function dispatchLlm(
  nodeId: string,
  data: Extract<WorkflowNodeData, { kind: "runAnyLLM" }>,
  inputs: NodeOutput
): Promise<NodeOutput> {
  const payload: LlmTaskPayload = {
    nodeId,
    model: data.model,
    systemPrompt: String(inputs.system_prompt ?? data.systemPrompt ?? ""),
    userMessage: String(inputs.user_message ?? data.userMessage ?? ""),
    images: Array.isArray(inputs.images) ? inputs.images.map(String) : []
  };

  const result = await runLlm(payload);

  return {
    value: result.text,
    text: result.text
  };
}

async function dispatchCrop(
  nodeId: string,
  data: Extract<WorkflowNodeData, { kind: "cropImage" }>,
  inputs: NodeOutput
): Promise<NodeOutput> {
  const payload: CropImageTaskPayload = {
    nodeId,
    imageUrl: String(inputs.image ?? data.imageUrl ?? ""),
    x: data.x,
    y: data.y,
    width: data.width,
    height: data.height
  };

  const result = await runCropImage(payload);

  return {
    value: result.outputUrl,
    image: result.outputUrl
  };
}


async function dispatchExtractFrame(
  nodeId: string,
  data: Extract<WorkflowNodeData, { kind: "extractFrame" }>,
  inputs: NodeOutput
): Promise<NodeOutput> {
  const payload: ExtractFrameTaskPayload = {
    nodeId,
    videoUrl: String(inputs.video ?? data.videoUrl ?? ""),
    timestamp: data.timestamp
  };

  const result = await runExtractFrame(payload);

  return {
    value: result.outputUrl,
    image: result.outputUrl
  };
}