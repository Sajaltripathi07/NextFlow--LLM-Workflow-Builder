import { PrismaClient } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import type { WorkflowRecord, WorkflowRunRecord } from "../domain/workflow-types.js";

type CreateWorkflowInput = {
  clerkUserId: string;
  name: string;
  definition: Record<string, unknown>;
  viewport: Record<string, unknown> | null;
};

const memoryStore = new Map<string, WorkflowRecord>();

export async function listWorkflows(clerkUserId: string): Promise<WorkflowRecord[]> {
  if (!prisma) {
    return [...memoryStore.values()].filter((w) => w.clerkUserId === clerkUserId);
  }
  const workflows = await (prisma as PrismaClient).workflow.findMany({
    where: { clerkUserId },
    include: { runs: { include: { nodeRuns: true }, orderBy: { startedAt: "desc" } } },
    orderBy: { updatedAt: "desc" }
  });
  return workflows.map(mapWorkflowRecord);
}

export async function getWorkflow(workflowId: string): Promise<WorkflowRecord | null> {
  if (!prisma) return memoryStore.get(workflowId) ?? null;
  const workflow = await (prisma as PrismaClient).workflow.findUnique({
    where: { id: workflowId },
    include: { runs: { include: { nodeRuns: true }, orderBy: { startedAt: "desc" } } }
  });
  return workflow ? mapWorkflowRecord(workflow) : null;
}

export async function saveWorkflow(input: CreateWorkflowInput): Promise<WorkflowRecord> {
  if (!prisma) {
    const existing = [...memoryStore.values()].find(
      (w) => w.clerkUserId === input.clerkUserId && w.name === input.name
    );
    const now = new Date().toISOString();
    const workflow: WorkflowRecord = {
      id: existing?.id ?? `wf_${crypto.randomUUID()}`,
      clerkUserId: input.clerkUserId,
      name: input.name,
      definition: input.definition as WorkflowRecord["definition"],
      viewport: input.viewport,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      runs: existing?.runs ?? []
    };
    memoryStore.set(workflow.id, workflow);
    return workflow;
  }
  const existing = await (prisma as PrismaClient).workflow.findFirst({
    where: { clerkUserId: input.clerkUserId, name: input.name },
    select: { id: true }
  });
  const sharedData = { definition: input.definition, viewport: input.viewport ?? null };
  const workflow = existing
    ? await (prisma as PrismaClient).workflow.update({
        where: { id: existing.id },
        data: sharedData,
        include: { runs: { include: { nodeRuns: true }, orderBy: { startedAt: "desc" } } }
      })
    : await (prisma as PrismaClient).workflow.create({
        data: { clerkUserId: input.clerkUserId, name: input.name, ...sharedData },
        include: { runs: { include: { nodeRuns: true }, orderBy: { startedAt: "desc" } } }
      });
  return mapWorkflowRecord(workflow);
}

export async function appendRun(workflowId: string, run: WorkflowRunRecord): Promise<WorkflowRecord> {
  if (!prisma) {
    const workflow = memoryStore.get(workflowId);
    if (!workflow) throw new Error("Workflow not found.");
    workflow.runs = [run, ...workflow.runs];
    workflow.updatedAt = new Date().toISOString();
    memoryStore.set(workflowId, workflow);
    return workflow;
  }
  await (prisma as PrismaClient).workflowRun.create({
    data: {
      id: run.id,
      workflowId,
      status: run.status,
      scope: run.scope,
      startedAt: new Date(run.startedAt),
      completedAt: run.completedAt ? new Date(run.completedAt) : null,
      durationMs: run.durationMs,
      selectedNodeIds: run.selectedNodeIds,
      summary: (run.summary ?? {}) as object,
      nodeRuns: {
        create: run.nodeRuns.map((nr) => ({
          id: nr.id,
          nodeId: nr.nodeId,
          nodeType: nr.nodeType,
          status: nr.status,
          inputs: (nr.inputs ?? {}) as object,
          outputs: (nr.outputs ?? {}) as object,
          startedAt: new Date(nr.startedAt),
          completedAt: nr.completedAt ? new Date(nr.completedAt) : null,
          durationMs: nr.durationMs,
          error: nr.error
        }))
      }
    }
  });
  const workflow = await getWorkflow(workflowId);
  if (!workflow) throw new Error("Workflow not found after appending run.");
  return workflow;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWorkflowRecord(workflow: any): WorkflowRecord {
  const runs: WorkflowRunRecord[] = (workflow.runs ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((run: any): WorkflowRunRecord => ({
      id: String(run.id),
      workflowId: String(run.workflowId),
      status: run.status,
      scope: run.scope,
      startedAt: run.startedAt instanceof Date ? run.startedAt.toISOString() : String(run.startedAt),
      completedAt: run.completedAt
        ? (run.completedAt instanceof Date ? run.completedAt.toISOString() : String(run.completedAt))
        : null,
      durationMs: typeof run.durationMs === "number" ? run.durationMs : null,
      selectedNodeIds: Array.isArray(run.selectedNodeIds) ? run.selectedNodeIds.map(String) : [],
      summary: run.summary ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodeRuns: (run.nodeRuns ?? []).map((nr: any) => ({
        id: String(nr.id),
        nodeId: String(nr.nodeId),
        nodeType: nr.nodeType,
        status: nr.status,
        inputs: nr.inputs ?? {},
        outputs: nr.outputs ?? null,
        startedAt: nr.startedAt instanceof Date ? nr.startedAt.toISOString() : String(nr.startedAt),
        completedAt: nr.completedAt
          ? (nr.completedAt instanceof Date ? nr.completedAt.toISOString() : String(nr.completedAt))
          : null,
        durationMs: typeof nr.durationMs === "number" ? nr.durationMs : null,
        error: nr.error ? String(nr.error) : null
      }))
    }))
    .sort((a: WorkflowRunRecord, b: WorkflowRunRecord) => b.startedAt.localeCompare(a.startedAt));

  return {
    id: String(workflow.id),
    clerkUserId: String(workflow.clerkUserId),
    name: String(workflow.name),
    definition: workflow.definition as WorkflowRecord["definition"],
    viewport: workflow.viewport ?? null,
    createdAt: workflow.createdAt instanceof Date ? workflow.createdAt.toISOString() : String(workflow.createdAt),
    updatedAt: workflow.updatedAt instanceof Date ? workflow.updatedAt.toISOString() : String(workflow.updatedAt),
    runs
  };
}
