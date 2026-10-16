const targetRoleService = require("../services/targetRoleService");

const getAvailableTargetRoles = async (req, res, next) => {
  try {
    const roles =
      await targetRoleService.getAvailableTargetRoles();

    return res.status(200).json({
      success: true,
      data: {
        roles,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyTargetRoles = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const roles =
      await targetRoleService.getCandidateTargetRoles(
        candidateId
      );

    return res.status(200).json({
      success: true,
      data: {
        roles,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addMyTargetRole = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const roleId = Number(req.body.role_id);

    if (!Number.isInteger(roleId) || roleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid role_id is required",
      });
    }

    const role =
      await targetRoleService.addCandidateTargetRole({
        candidateId,
        roleId,
      });

    return res.status(201).json({
      success: true,
      message: "Target role added successfully",
      data: {
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteMyTargetRole = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const roleId = Number(req.params.roleId);

    if (!Number.isInteger(roleId) || roleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid roleId",
      });
    }

    const role =
      await targetRoleService.deleteCandidateTargetRole({
        candidateId,
        roleId,
      });

    return res.status(200).json({
      success: true,
      message: "Target role removed successfully",
      data: {
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableTargetRoles,
  getMyTargetRoles,
  addMyTargetRole,
  deleteMyTargetRole,
};