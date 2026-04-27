import cors from "@fastify/cors";
import Fastify from "fastify";

import { env } from "./lib/env.js";
import { healthRoutes } from "./routes/health.js";
import { triggerRoutes } from "./routes/trigger.js";
import { workflowRoutes } from "./routes/workflows.js";

export function buildApp() {
  const app = Fastify({ logger: { level: "info" } });

  app.register(cors, {
    origin: [env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true
  });

  app.register(healthRoutes, { prefix: "/api" });
  app.register(workflowRoutes, { prefix: "/api" });
  app.register(triggerRoutes, { prefix: "/api" });

  return app;
}
