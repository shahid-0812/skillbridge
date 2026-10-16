const DEFAULT_RESOURCES = {
  cpu: 1,
  memoryMb: 384,
  pidsLimit: 100,
  timeoutMinutes: 30,
};

/*
 * Trusted environment catalog.
 *
 * The AI may identify the required environment profile,
 * but it never controls Docker configuration directly.
 * Only profiles defined here can be provisioned.
 */
const ENVIRONMENT_CATALOG = {
  linux: {
    environmentType: "docker",
    baseImage: "almalinux:9",
    network: "none",
    workspacePath: "/workspace",
  },

  python: {
    environmentType: "docker",
    baseImage: "python:3.12-slim",
    network: "none",
    workspacePath: "/workspace",
  },

  coding: {
    environmentType: "docker",
    baseImage: "python:3.12-slim",
    network: "none",
    workspacePath: "/workspace",
  },

  data_analysis: {
    environmentType: "docker",
    baseImage: "python:3.12-slim",
    network: "none",
    workspacePath: "/workspace",
  },

  kubernetes: {
    environmentType: "docker",
    baseImage: "almalinux:9",
    network: "none",
    workspacePath: "/workspace",
  },

  docker: {
    environmentType: "docker",
    baseImage: "almalinux:9",
    network: "none",
    workspacePath: "/workspace",
  },

  git: {
    environmentType: "docker",
    baseImage: "almalinux:9",
    network: "none",
    workspacePath: "/workspace",
  },

  node: {
    environmentType: "docker",
    baseImage: "python:3.12-slim",
    network: "none",
    workspacePath: "/workspace",
  },

  sql: {
    environmentType: "docker",
    baseImage: "python:3.12-slim",
    network: "none",
    workspacePath: "/workspace",
  },

  postgres: {
    environmentType: "docker",
    baseImage: "python:3.12-slim",
    network: "none",
    workspacePath: "/workspace",
  },

  mysql: {
    environmentType: "docker",
    baseImage: "python:3.12-slim",
    network: "none",
    workspacePath: "/workspace",
  },

  terraform: {
    environmentType: "docker",
    baseImage: "almalinux:9",
    network: "none",
    workspacePath: "/workspace",
  },

  ansible: {
    environmentType: "docker",
    baseImage: "almalinux:9",
    network: "none",
    workspacePath: "/workspace",
  },

  jenkins: {
    environmentType: "docker",
    baseImage: "almalinux:9",
    network: "none",
    workspacePath: "/workspace",
  },

  browser: {
    environmentType: "browser",
    baseImage: null,
    network: "restricted",
    workspacePath: "/workspace",
  },

  case_study: {
    environmentType: "browser",
    baseImage: null,
    network: "restricted",
    workspacePath: "/workspace",
  },

  written_response: {
    environmentType: "browser",
    baseImage: null,
    network: "restricted",
    workspacePath: "/workspace",
  },
};

const ASSESSMENT_TYPE_PROFILES = {
  CODING: "coding",
  TROUBLESHOOTING: "linux",
  DATA_ANALYSIS: "data_analysis",
  DESIGN: "browser",
  CASE_STUDY: "case_study",
  WRITTEN_RESPONSE: "written_response",
  PRACTICAL: "linux",
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function resolveEnvironmentProfile(skill, assessmentType) {
  const normalizedSkill = normalize(skill);

  /*
   * Skill-specific environments take priority.
   * This allows new skills to be added without changing
   * the core provisioning pipeline.
   */
  if (ENVIRONMENT_CATALOG[normalizedSkill]) {
    return {
      profileName: normalizedSkill,
      profile: ENVIRONMENT_CATALOG[normalizedSkill],
    };
  }

  /*
   * Unknown skills fall back to their assessment method.
   * The skill can therefore still be assessed even when
   * a dedicated environment has not yet been registered.
   */
  const type = String(assessmentType || "PRACTICAL")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");

  const fallbackName =
    ASSESSMENT_TYPE_PROFILES[type] || "linux";

  return {
    profileName: fallbackName,
    profile:
      ENVIRONMENT_CATALOG[fallbackName] ||
      ENVIRONMENT_CATALOG.linux,
  };
}

function planEnvironment({
  skill,
  difficulty,
  assessmentType,
}) {
  const resolved = resolveEnvironmentProfile(
    skill,
    assessmentType
  );

  const profile = resolved.profile;

  return {
    skill: skill || "Unknown",
    difficulty: difficulty || "Basic",

    environmentProfile: resolved.profileName,

    environmentType: profile.environmentType,
    baseImage: profile.baseImage,
    network: profile.network,
    workspacePath: profile.workspacePath,

    resources: {
      ...DEFAULT_RESOURCES,
    },

    security: {
      privileged: false,
      readOnlyRootFilesystem:
        profile.environmentType === "docker",
      dropCapabilities:
        profile.environmentType === "docker",
      dockerSocket: false,
      hostFilesystem: false,
    },

    timeoutMinutes: DEFAULT_RESOURCES.timeoutMinutes,
  };
}

module.exports = {
  planEnvironment,
  ENVIRONMENT_CATALOG,
};
