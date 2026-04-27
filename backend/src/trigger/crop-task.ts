import { task } from "@trigger.dev/sdk";
import crypto from "crypto";

import type { CropImageTaskPayload, CropImageTaskResult } from "./task-types.js";

function buildSignature(paramsString: string, secret: string): string {
  return (
    "sha1:" +
    crypto.createHmac("sha1", secret).update(paramsString).digest("hex")
  );
}

export async function runCropImage(
  payload: CropImageTaskPayload
): Promise<CropImageTaskResult> {
  const transloaditKey = process.env.TRANSLOADIT_KEY;
  const transloaditSecret = process.env.TRANSLOADIT_SECRET;

  if (!transloaditKey || !transloaditSecret) {
    return { nodeId: payload.nodeId, outputUrl: payload.imageUrl };
  }

  const x1 = Math.max(0, Math.min(100, payload.x));
  const y1 = Math.max(0, Math.min(100, payload.y));
  const x2 = Math.max(0, Math.min(100, payload.x + payload.width));
  const y2 = Math.max(0, Math.min(100, payload.y + payload.height));

  const steps = {
    import_step: {
      robot: "/http/import",
      url: payload.imageUrl,
      headers: { "User-Agent": "Mozilla/5.0" }
    },
    crop_step: {
      robot: "/image/resize",
      use: "import_step",
      result: true,
      crop: {
        x1: `${x1}p`,
        y1: `${y1}p`,
        x2: `${x2}p`,
        y2: `${y2}p`
      },
      imagemagick_stack: "v3.0.1"
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
      console.error("Transloadit crop 400:", errText);
      return { nodeId: payload.nodeId, outputUrl: payload.imageUrl };
    }

    const assembly = await assemblyRes.json() as { assembly_ssl_url: string };
    assemblyUrl = assembly.assembly_ssl_url;
  } catch (err) {
    console.error("Transloadit crop fetch error:", err);
    return { nodeId: payload.nodeId, outputUrl: payload.imageUrl };
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
          status.results?.crop_step?.[0] ??
          status.results?.resize?.[0] ??
          Object.values(status.results ?? {})[0]?.[0];

        if (resultFile?.ssl_url) {
          return { nodeId: payload.nodeId, outputUrl: resultFile.ssl_url };
        }
        return { nodeId: payload.nodeId, outputUrl: payload.imageUrl };
      }

      if (status.error) {
        console.error("Transloadit crop error:", status.error);
        return { nodeId: payload.nodeId, outputUrl: payload.imageUrl };
      }
    } catch (pollErr) {
      console.error("Transloadit crop poll error:", pollErr);
    }
  }

  return { nodeId: payload.nodeId, outputUrl: payload.imageUrl };
}

export const cropImageTask = task({
  id: "nextflow-crop-image",
  retry: { maxAttempts: 2, minTimeoutInMs: 500, maxTimeoutInMs: 8000, factor: 2 },
  run: runCropImage
});