const candidateSkillService = require("../services/candidateSkillService");

const getMySkills = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const skills =
      await candidateSkillService.getCandidateSkills(candidateId);

    return res.status(200).json({
      success: true,
      data: {
        skills,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addMySkill = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const {
      skill_id,
      claimed_level,
    } = req.body;

    if (!skill_id) {
      return res.status(400).json({
        success: false,
        message: "skill_id is required",
      });
    }

    if (!claimed_level) {
      return res.status(400).json({
        success: false,
        message: "claimed_level is required",
      });
    }

    if (
      !["Basic", "Intermediate", "Advanced"].includes(
        claimed_level
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "claimed_level must be Basic, Intermediate or Advanced",
      });
    }

    const skill =
      await candidateSkillService.addCandidateSkill({
        candidateId,
        skillId: skill_id,
        claimedLevel: claimed_level,
      });

    return res.status(201).json({
      success: true,
      message: "Candidate skill added successfully",
      data: {
        skill,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMySkill = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const skillId = Number(req.params.skillId);

    if (!Number.isInteger(skillId) || skillId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid skillId",
      });
    }

    const {
      claimed_level,
    } = req.body;

    if (!claimed_level) {
      return res.status(400).json({
        success: false,
        message: "claimed_level is required",
      });
    }

    if (
      !["Basic", "Intermediate", "Advanced"].includes(
        claimed_level
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "claimed_level must be Basic, Intermediate or Advanced",
      });
    }

    const skill =
      await candidateSkillService.updateCandidateSkill({
        candidateId,
        skillId,
        claimedLevel: claimed_level,
      });

    return res.status(200).json({
      success: true,
      message: "Candidate skill updated successfully",
      data: {
        skill,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteMySkill = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const skillId = Number(req.params.skillId);

    if (!Number.isInteger(skillId) || skillId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid skillId",
      });
    }

    const deletedSkill =
      await candidateSkillService.deleteCandidateSkill({
        candidateId,
        skillId,
      });

    return res.status(200).json({
      success: true,
      message: "Candidate skill deleted successfully",
      data: {
        skill: deletedSkill,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMySkills,
  addMySkill,
  updateMySkill,
  deleteMySkill,
};