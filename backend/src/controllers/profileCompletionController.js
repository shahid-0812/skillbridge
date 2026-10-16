const profileCompletionService = require("../services/profileCompletionService");

const getMyProfileCompletion = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const completion =
      await profileCompletionService.getProfileCompletion(candidateId);

    res.status(200).json({
      success: true,
      data: {
        completion,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfileCompletion,
};
