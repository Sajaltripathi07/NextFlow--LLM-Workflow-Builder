export type LlmTaskPayload = {
  nodeId: string;
  model: string;
  systemPrompt: string;
  userMessage: string;
  images: string[];
};

export type LlmTaskResult = {
  nodeId: string;
  text: string;
};

export type CropImageTaskPayload = {
  nodeId: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropImageTaskResult = {
  nodeId: string;
  outputUrl: string;
};

export type ExtractFrameTaskPayload = {
  nodeId: string;
  videoUrl: string;
  timestamp: number;
};

export type ExtractFrameTaskResult = {
  nodeId: string;
  outputUrl: string;
};
