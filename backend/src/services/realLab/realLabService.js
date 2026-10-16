const { planEnvironment } = require("./environmentPlanner");
const { validateEnvironment } = require("./policyEngine");
const { getProvisioner } = require("./provisionerFactory");

async function startRealLab({
  skill,
  difficulty,
  assessmentType,
  assessment = {},
}) {
  const environment = planEnvironment({
    skill,
    difficulty,
    assessmentType,
  });

  environment.assessmentType = assessmentType;
  environment.assessment = {
    scenario: assessment.scenario || "",
    tasks: assessment.tasks || [],
    success_conditions: assessment.success_conditions || [],
    evidence_required: assessment.evidence_required || [],
    time_limit_minutes: assessment.time_limit_minutes || 30,
  };

  const policy = validateEnvironment(environment);

  if (!policy.allowed) {
    const error = new Error(
      `RealLab environment rejected: ${policy.errors.join("; ")}`
    );

    error.code = "REAL_LAB_POLICY_REJECTED";
    error.details = policy.errors;

    throw error;
  }

  const provisioner = getProvisioner(environment);

  const lab = await provisioner.startLab(environment);

  return {
    lab,
    environment,
    policy,
  };
}

async function stopRealLab(labId, environmentType = "docker") {
  const provisioner = getProvisioner({
    environmentType,
  });

  return provisioner.stopLab(labId);
}

module.exports = {
  startRealLab,
  stopRealLab,
};
