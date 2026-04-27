import { buildApp } from "./app.js";
import { env } from "./lib/env.js";

const app = buildApp();

app.listen({ port: env.PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`NextFlow backend running at ${address}`);
});
