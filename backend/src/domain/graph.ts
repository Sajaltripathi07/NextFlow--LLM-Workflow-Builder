import type { WorkflowDefinition, WorkflowEdge, WorkflowNode } from "./workflow-types.js";

export function validateWorkflowGraph(definition: WorkflowDefinition) {
  const nodeIds = new Set(definition.nodes.map((n) => n.id));
  for (const edge of definition.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error(`Edge references unknown node`);
    }
  }
  if (hasCycle(definition)) {
    throw new Error("Workflow contains a cycle");
  }
}

function hasCycle(definition: WorkflowDefinition) {
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const node of definition.nodes) {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  }

  for (const edge of definition.edges) {
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

  return visited !== definition.nodes.length;
}

export function buildExecutionLayers(
  definition: WorkflowDefinition,
  selectedNodeIds: string[]
): string[][] {
  const allNodeIds = new Set(definition.nodes.map((n) => n.id));
  const targetIds =
    selectedNodeIds.length > 0
      ? new Set(selectedNodeIds.filter((id) => allNodeIds.has(id)))
      : allNodeIds;

  const relevantEdges = definition.edges.filter(
    (e) => targetIds.has(e.source) && targetIds.has(e.target)
  );

  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const id of targetIds) {
    adjacency.set(id, []);
    indegree.set(id, 0);
  }

  for (const edge of relevantEdges) {
    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  const layers: string[][] = [];
  let frontier = [...indegree.entries()].filter(([, c]) => c === 0).map(([id]) => id);

  while (frontier.length > 0) {
    layers.push(frontier);
    const next: string[] = [];
    for (const nodeId of frontier) {
      for (const dep of adjacency.get(nodeId) ?? []) {
        const newCount = (indegree.get(dep) ?? 0) - 1;
        indegree.set(dep, newCount);
        if (newCount === 0) next.push(dep);
      }
    }
    frontier = next;
  }

  return layers;
}

export function collectNodeInputs(
  definition: WorkflowDefinition,
  nodeId: string,
  outputsByNodeId: Record<string, Record<string, unknown>>
): Record<string, unknown> {
  const incomingEdges = definition.edges.filter((e) => e.target === nodeId);
  const inputs: Record<string, unknown> = {};

  for (const edge of incomingEdges) {
    const sourceOutputs = outputsByNodeId[edge.source];
    if (!sourceOutputs) continue;

    const value = sourceOutputs[edge.sourceHandle] ?? sourceOutputs.value;
    const targetKey = edge.targetHandle;

    if (targetKey === "images") {
      const existing = inputs.images;
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        inputs.images = [value];
      }
    } else {
      inputs[targetKey] = value;
    }
  }

  return inputs;
}
