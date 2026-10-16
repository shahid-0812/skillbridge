const skillVerificationService = require("../services/skillVerificationService");

const getSkillId = (req) => {
  const skillId = Number(req.params.skillId);

  if (!Number.isInteger(skillId) || skillId <= 0) {
    const error = new Error("Invalid skillId");
    error.statusCode = 400;
    throw error;
  }

  return skillId;
};

/*
 * Create a new 5-question assessment attempt.
 *
 * For v1, the questions can be supplied by the
 * assessment-generation layer.
 */
const createMyVerificationAttempt = async (req, res, next) => {
  try {
    const skillId = getSkillId(req);
    const candidateId = req.identity.candidateId;

    const result =
      await skillVerificationService.createVerificationAttempt({
        candidateId,
        skillId,
      });

    return res.status(201).json({
      success: true,
      message: "Skill verification attempt created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Start the assessment.
 */
const startMyAssessment = async (req, res, next) => {
  try {
    const result =
      await skillVerificationService.startAssessment({
        candidateId: req.identity.candidateId,
        skillId: getSkillId(req),
      });

    return res.status(200).json({
      success: true,
      message: "Assessment started successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Submit all 5 answers.
 */
const submitMyAssessment = async (req, res, next) => {
  try {
    const attemptId = Number(req.params.attemptId);

    if (!Number.isInteger(attemptId) || attemptId <= 0) {
      const error = new Error("Invalid attemptId");
      error.statusCode = 400;
      throw error;
    }

    const result =
      await skillVerificationService.submitAssessment({
        candidateId: req.identity.candidateId,
        skillId: getSkillId(req),
        attemptId,
        answers: req.body.answers,
      });

    return res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Get current verification status.
 */
const getMyVerificationStatus = async (req, res, next) => {
  try {
    const result =
      await skillVerificationService.getVerificationStatus({
        candidateId: req.identity.candidateId,
        skillId: getSkillId(req),
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMyVerificationAttempt,
  startMyAssessment,
  submitMyAssessment,
  getMyVerificationStatus,
};