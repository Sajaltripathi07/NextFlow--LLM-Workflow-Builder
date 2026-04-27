import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { runWorkflowSchema } from "../domain/workflow-schema.js";
import { runWorkflowService } from "../services/workflow-service.js";

const triggerSingleNodeSchema = z.object({
  clerkUserId: z.string(),
  workflowId: z.string(),
  nodeId: z.string(),
  definition: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any())
  })
});

export async function triggerRoutes(app: FastifyInstance) {
  app.post("/trigger/workflow", async (request, reply) => {
    try {
      const input = runWorkflowSchema.parse(request.body);
      const workflow = await runWorkflowService(input);
      return { ok: true, workflow, latestRun: workflow.runs[0] ?? null };
    } catch (error) {
      reply.code(400);
      return { ok: false, error: error instanceof Error ? error.message : "Bad request" };
    }
  });

  app.post("/trigger/node", async (request, reply) => {
    try {
      const { clerkUserId, workflowId, nodeId, definition } =
        triggerSingleNodeSchema.parse(request.body);

      const input = runWorkflowSchema.parse({
        clerkUserId,
        name: workflowId,
        definition,
        scope: "node",
        selectedNodeIds: [nodeId]
      });

      const workflow = await runWorkflowService(input);
      return { ok: true, workflow, latestRun: workflow.runs[0] ?? null };
    } catch (error) {
      reply.code(400);
      return { ok: false, error: error instanceof Error ? error.message : "Bad request" };
    }
  });

  app.get("/trigger/status/:runId", async (request, reply) => {
    const { runId } = request.params as { runId: string };
    reply.code(200);
    return {
      ok: true,
      runId,
      status: "completed",
      message: "Poll /api/workflows for full run history"
    };
  });
}
