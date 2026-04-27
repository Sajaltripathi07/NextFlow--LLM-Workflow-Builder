import { buildExecutionLayers, collectNodeInputs, validateWorkflowGraph } from "./graph.js";
import type {
  NodeExecutionRecord,
  WorkflowDefinition,
  WorkflowNode,
  WorkflowRunRecord,
  WorkflowRunScope
} from "./workflow-types.js";
import { runNodeViaTrigger } from "../trigger/task-runner.js";

export async function executeWorkflow(options: {
  workflowId: string;
  definition: WorkflowDefinition;
  scope: WorkflowRunScope;
  selectedNodeIds: string[];
}): Promise<WorkflowRunRecord> {
  validateWorkflowGraph(options.definition);

  const runId = `run_${crypto.randomUUID()}`;
  const startedAt = new Date();
  const executionLayers = buildExecutionLayers(options.definition, options.selectedNodeIds);
  const nodeMap = new Map(options.definition.nodes.map((node) => [node.id, node]));
  const outputsByNodeId: Record<string, Record<string, unknown>> = {};
  const nodeRuns: NodeExecutionRecord[] = [];

  try {
    for (const layer of executionLayers) {
      const layerResults = await Promise.all(
        layer.map(async (nodeId) => {
          const node = nodeMap.get(nodeId);
          if (!node) {
            return buildFailedNodeRun(
              { id: nodeId, type: "text", position: { x: 0, y: 0 }, data: { kind: "text", title: "Unknown", subtitle: "", role: "text", text: "" } },
              {},
              `Missing node ${nodeId}`
            );
          }

          const inputs = collectNodeInputs(options.definition, nodeId, outputsByNodeId);
          const started = Date.now();

          try {
            const outputs = await runNodeViaTrigger(node, inputs);
            outputsByNodeId[node.id] = outputs;
            return buildNodeRun(node, {
              id: `nrun_${crypto.randomUUID()}`,
              status: "success",
              inputs,
              outputs,
              started,
              error: null
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Node execution failed";
            return buildNodeRun(node, {
              id: `nrun_${crypto.randomUUID()}`,
              status: "failed",
              inputs,
              outputs: null,
              started,
              error: message
            });
          }
        })
      );

      nodeRuns.push(...layerResults);

      const failedNode = layerResults.find((r) => r.status === "failed");
      if (failedNode) {
        throw new Error(failedNode.error ?? "Workflow execution failed");
      }
    }

    const completedAt = new Date();
    return buildWorkflowRun({
      workflowId: options.workflowId,
      runId,
      status: "success",
      scope: options.scope,
      selectedNodeIds: options.selectedNodeIds,
      startedAt,
      completedAt,
      nodeRuns
    });
  } catch (error) {
    const completedAt = new Date();
    return buildWorkflowRun({
      workflowId: options.workflowId,
      runId,
      status: "failed",
      scope: options.scope,
      selectedNodeIds: options.selectedNodeIds,
      startedAt,
      completedAt,
      nodeRuns,
      error: error instanceof Error ? error.message : "Workflow execution failed"
    });
  }
}

function buildFailedNodeRun(
  node: WorkflowNode,
  inputs: Record<string, unknown>,
  error: string
): NodeExecutionRecord {
  const now = Date.now();
  return buildNodeRun(node, {
    id: `nrun_${crypto.randomUUID()}`,
    status: "failed",
    inputs,
    outputs: null,
    started: now,
    error
  });
}

function buildNodeRun(
  node: WorkflowNode,
  options: {
    id: string;
    status: "success" | "failed";
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown> | null;
    started: number;
    error: string | null;
  }
): NodeExecutionRecord {
  const completed = Date.now();
  return {
    id: options.id,
    nodeId: node.id,
    nodeType: node.type,
    status: options.status,
    inputs: options.inputs,
    outputs: options.outputs,
    startedAt: new Date(options.started).toISOString(),
    completedAt: new Date(completed).toISOString(),
    durationMs: completed - options.started,
    error: options.error
  };
}

function buildWorkflowRun(options: {
  workflowId: string;
  runId: string;
  status: "success" | "failed";
  scope: WorkflowRunScope;
  selectedNodeIds: string[];
  startedAt: Date;
  completedAt: Date;
  nodeRuns: NodeExecutionRecord[];
  error?: string;
}): WorkflowRunRecord {
  return {
    id: options.runId,
    workflowId: options.workflowId,
    status: options.status,
    scope: options.scope,
    startedAt: options.startedAt.toISOString(),
    completedAt: options.completedAt.toISOString(),
    durationMs: options.completedAt.getTime() - options.startedAt.getTime(),
    selectedNodeIds: options.selectedNodeIds,
    summary: {
      completedNodes: options.nodeRuns.filter((r) => r.status === "success").length,
      failedNodes: options.nodeRuns.filter((r) => r.status === "failed").length,
      error: options.error ?? null
    },
    nodeRuns: options.nodeRuns
  };
}
