import { task } from "@trigger.dev/sdk";
import crypto from "crypto";

import type { ExtractFrameTaskPayload, ExtractFrameTaskResult } from "./task-types.js";

function buildSignature(paramsString: string, secret: string): string {
  return (
    "sha1:" +
    crypto.createHmac("sha1", secret).update(paramsString).digest("hex")
  );
}

export async function runExtractFrame(
  payload: ExtractFrameTaskPayload
): Promise<ExtractFrameTaskResult> {
  const transloaditKey = process.env.TRANSLOADIT_KEY;
  const transloaditSecret = process.env.TRANSLOADIT_SECRET;

  if (!transloaditKey || !transloaditSecret) {
    return { nodeId: payload.nodeId, outputUrl: payload.videoUrl };
  }

  const offsetSeconds = Math.max(0, payload.timestamp);

  const steps = {
    import_step: {
      robot: "/http/import",
      url: payload.videoUrl,
      headers: { "User-Agent": "Mozilla/5.0" }
    },
    frame_step: {
      robot: "/video/thumbs",
      use: "import_step",
      result: true,
      count: 1,
      offsets: [offsetSeconds],
      width: 1280,
      height: 720,
      resize_strategy: "fit",
      format: "jpg",
      quality: 85
    }
  };

  const params = {
    auth: { key: transloaditKey },
    steps
  };

  const paramsString = JSON.stringify(params);
  const signature = buildSignature(paramsString, transloaditSecret);

  const formData = new URLSearchParams();
  formData.append("params", paramsString);
  formData.append("signature", signature);

  let assemblyUrl: string;

  try {
    const assemblyRes = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });

    if (!assemblyRes.ok) {
      const errText = await assemblyRes.text();
      console.error("Transloadit frame 400:", errText);
      return { nodeId: payload.nodeId, outputUrl: payload.videoUrl };
    }

    const assembly = await assemblyRes.json() as { assembly_ssl_url: string };
    assemblyUrl = assembly.assembly_ssl_url;
  } catch (err) {
    console.error("Transloadit frame fetch error:", err);
    return { nodeId: payload.nodeId, outputUrl: payload.videoUrl };
  }

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    try {
      const pollRes = await fetch(assemblyUrl);
      const status = await pollRes.json() as {
        ok: string;
        results?: Record<string, Array<{ ssl_url: string }>>;
        error?: string;
      };

      if (status.ok === "ASSEMBLY_COMPLETED") {
        const resultFile =
          status.results?.frame_step?.[0] ??
          status.results?.frame?.[0] ??
          Object.values(status.results ?? {})[0]?.[0];

        if (resultFile?.ssl_url) {
          return { nodeId: payload.nodeId, outputUrl: resultFile.ssl_url };
        }
        return { nodeId: payload.nodeId, outputUrl: payload.videoUrl };
      }

      if (status.error) {
        console.error("Transloadit frame error:", status.error);
        return { nodeId: payload.nodeId, outputUrl: payload.videoUrl };
      }
    } catch (pollErr) {
      console.error("Transloadit frame poll error:", pollErr);
    }
  }

  return { nodeId: payload.nodeId, outputUrl: payload.videoUrl };
}

export const extractFrameTask = task({
  id: "nextflow-extract-frame",
  retry: { maxAttempts: 2, minTimeoutInMs: 500, maxTimeoutInMs: 8000, factor: 2 },
  run: runExtractFrame
});