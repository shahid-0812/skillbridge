const LIMITS = {
  maxCpu: 1,
  maxMemoryMb: 512,
  maxPids: 100,
  maxTimeoutMinutes: 60,
};

function validateEnvironment(environment) {
  const errors = [];

  if (!environment) {
    return {
      allowed: false,
      errors: ["Environment specification is required"],
    };
  }

  if (environment.environmentType !== "docker") {
    errors.push("Unsupported environment type");
  }

  if (!environment.baseImage) {
    errors.push("Docker base image is required");
  }

  const resources = environment.resources || {};

  if (resources.cpu > LIMITS.maxCpu) {
    errors.push(`CPU exceeds ${LIMITS.maxCpu} core`);
  }

  if (resources.memoryMb > LIMITS.maxMemoryMb) {
    errors.push(`Memory exceeds ${LIMITS.maxMemoryMb} MB`);
  }

  if (resources.pidsLimit > LIMITS.maxPids) {
    errors.push(`PID limit exceeds ${LIMITS.maxPids}`);
  }

  if (resources.timeoutMinutes > LIMITS.maxTimeoutMinutes) {
    errors.push(
      `Timeout exceeds ${LIMITS.maxTimeoutMinutes} minutes`
    );
  }

  const security = environment.security || {};

  if (security.privileged === true) {
    errors.push("Privileged containers are not allowed");
  }

  if (security.dockerSocket === true) {
    errors.push("Docker socket access is not allowed");
  }

  if (security.hostFilesystem === true) {
    errors.push("Host filesystem access is not allowed");
  }

  if (environment.network !== "none") {
    errors.push("Only network-isolated Docker labs are allowed");
  }

  return {
    allowed: errors.length === 0,
    errors,
  };
}

module.exports = {
  LIMITS,
  validateEnvironment,
};
