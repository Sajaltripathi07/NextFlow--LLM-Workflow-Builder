import { executeWorkflow } from "../domain/execution.js";
import { saveWorkflowSchema, type RunWorkflowInput } from "../domain/workflow-schema.js";
import { appendRun, getWorkflow, listWorkflows, saveWorkflow } from "../repositories/workflow-repository.js";

export async function listUserWorkflows(clerkUserId: string) {
  return listWorkflows(clerkUserId);
}

export async function getWorkflowById(workflowId: string) {
  return getWorkflow(workflowId);
}

export async function saveWorkflowDefinition(input: unknown) {
  const parsed = saveWorkflowSchema.parse(input);
  return saveWorkflow({
    ...parsed,
    definition: parsed.definition as unknown as Record<string, unknown>,
    viewport: parsed.viewport ?? null
  });
}

export async function runWorkflowService(input: RunWorkflowInput) {
  const workflow = await saveWorkflow({
    clerkUserId: input.clerkUserId,
    name: input.name ?? "Untitled Workflow",
    definition: input.definition as unknown as Record<string, unknown>,
    viewport: null
  });

  const run = await executeWorkflow({
    workflowId: workflow.id,
    definition: input.definition,
    scope: input.scope,
    selectedNodeIds: input.selectedNodeIds
  });

  return appendRun(workflow.id, run);
}
