const http = require("http");

const REAL_LAB_AGENT_URL =
  process.env.REAL_LAB_AGENT_URL || "http://127.0.0.1:8787";

function requestAgent(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, REAL_LAB_AGENT_URL);

    const payload = body ? JSON.stringify(body) : null;

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(payload
            ? { "Content-Length": Buffer.byteLength(payload) }
            : {}),
        },
        timeout: 10000,
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          let parsed;

          try {
            parsed = data ? JSON.parse(data) : {};
          } catch {
            return reject(
              Object.assign(new Error("RealLab Agent returned invalid JSON"), {
                statusCode: 502,
                code: "REAL_LAB_INVALID_RESPONSE",
              })
            );
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            const detail =
              parsed.detail || `Agent HTTP ${res.statusCode}`;

            const agentError = new Error(detail);
            agentError.statusCode = 502;
            agentError.code = "REAL_LAB_AGENT_ERROR";
            return reject(agentError);
          }

          resolve(parsed);
        });
      }
    );

    req.on("timeout", () => {
      const timeoutError = new Error("RealLab Agent request timed out");
      timeoutError.statusCode = 502;
      timeoutError.code = "REAL_LAB_TIMEOUT";
      req.destroy(timeoutError);
    });

    req.on("error", (error) => {
      error.statusCode = error.statusCode || 502;
      error.code = error.code || "REAL_LAB_UNAVAILABLE";
      reject(error);
    });

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

async function startLab(environment) {
  if (!environment) {
    throw new Error("Environment specification is required");
  }

  const imageAlias =
    environment.baseImage === "python:3.12-slim"
      ? "python"
      : environment.baseImage === "almalinux:9"
        ? "linux"
        : "linux";

  return requestAgent("POST", "/labs/start", {
    skill: environment.skill,
    difficulty: environment.difficulty,
    assessment_type: environment.assessmentType || "PRACTICAL",
    image_alias: imageAlias,

    cpu: environment.resources.cpu,
    memory_mb: environment.resources.memoryMb,
    pids_limit: environment.resources.pidsLimit,
    timeout_minutes: environment.timeoutMinutes,

    assessment: environment.assessment || {},
  });
}

async function stopLab(labId) {
  if (!labId) {
    throw new Error("Lab ID is required");
  }

  return requestAgent(
    "POST",
    `/labs/${encodeURIComponent(labId)}/stop`
  );
}

async function healthCheck() {
  return requestAgent("GET", "/health");
}

module.exports = {
  startLab,
  stopLab,
  healthCheck,
};
