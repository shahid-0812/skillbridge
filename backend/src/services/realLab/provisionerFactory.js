const dockerProvisioner = require("./dockerProvisioner");

function getProvisioner(environment) {
  if (!environment) {
    throw new Error("Environment specification is required");
  }

  if (environment.environmentType === "docker") {
    return dockerProvisioner;
  }

  throw new Error(
    `No provisioner available for environment type: ${environment.environmentType}`
  );
}

module.exports = {
  getProvisioner,
};
