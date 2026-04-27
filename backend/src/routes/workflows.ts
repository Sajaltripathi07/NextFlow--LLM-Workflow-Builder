import type { FastifyInstance } from "fastify";

import { runWorkflowSchema, saveWorkflowSchema } from "../domain/workflow-schema.js";
import {
  getWorkflowById,
  listUserWorkflows,
  runWorkflowService,
  saveWorkflowDefinition
} from "../services/workflow-service.js";

export async function workflowRoutes(app: FastifyInstance) {
  app.get("/workflows", async (request) => {
    const clerkUserId = String(request.headers["x-clerk-user-id"] ?? "demo-user");
    const workflows = await listUserWorkflows(clerkUserId);
    return { ok: true, workflows };
  });

  app.get("/workflows/:workflowId", async (request, reply) => {
    const { workflowId } = request.params as { workflowId: string };
    const workflow = await getWorkflowById(workflowId);
    if (!workflow) {
      reply.code(404);
      return { ok: false, error: "Workflow not found" };
    }
    return { ok: true, workflow };
  });

  app.post("/workflows", async (request, reply) => {
    try {
      const input = saveWorkflowSchema.parse(request.body);
      const workflow = await saveWorkflowDefinition(input);
      return { ok: true, workflow };
    } catch (error) {
      reply.code(400);
      return { ok: false, error: error instanceof Error ? error.message : "Bad request" };
    }
  });

  app.post("/workflows/run", async (request, reply) => {
    try {
      const input = runWorkflowSchema.parse(request.body);
      const workflow = await runWorkflowService(input);
      return { ok: true, workflow, latestRun: workflow.runs[0] ?? null };
    } catch (error) {
      reply.code(400);
      return { ok: false, error: error instanceof Error ? error.message : "Bad request" };
    }
  });
}
