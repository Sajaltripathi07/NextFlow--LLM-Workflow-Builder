import cors from "@fastify/cors";
import Fastify from "fastify";

import { env } from "./lib/env.js";
import { healthRoutes } from "./routes/health.js";
import { triggerRoutes } from "./routes/trigger.js";
import { workflowRoutes } from "./routes/workflows.js";

export function buildApp() {
  const app = Fastify({ logger: { level: "info" } });

  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      const allowed = [
        env.FRONTEND_URL,
        "http://localhost:3000",
      ].filter(Boolean);

      const isAllowed =
        allowed.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com");

      cb(null, isAllowed ? true : new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-clerk-user-id"]
  });

  app.register(healthRoutes, { prefix: "/api" });
  app.register(workflowRoutes, { prefix: "/api" });
  app.register(triggerRoutes, { prefix: "/api" });

  return app;
}
