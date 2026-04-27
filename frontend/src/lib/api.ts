import type { WorkflowDefinition, WorkflowRecord, WorkflowRunScope } from "@/types/workflow";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function saveWorkflowRequest(payload: {
  clerkUserId: string;
  name: string;
  definition: WorkflowDefinition;
}): Promise<WorkflowRecord> {
  const data = await request<{ workflow: WorkflowRecord }>("/workflows", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.workflow;
}

export async function runWorkflowRequest(payload: {
  clerkUserId: string;
  name: string;
  definition: WorkflowDefinition;
  scope: WorkflowRunScope;
  selectedNodeIds: string[];
}): Promise<{ workflow: WorkflowRecord; latestRun: WorkflowRecord["runs"][0] | null }> {
  return request("/workflows/run", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function listWorkflowsRequest(clerkUserId: string): Promise<WorkflowRecord[]> {
  const data = await request<{ workflows: WorkflowRecord[] }>("/workflows", {
    headers: { "x-clerk-user-id": clerkUserId }
  });
  return data.workflows;
}
