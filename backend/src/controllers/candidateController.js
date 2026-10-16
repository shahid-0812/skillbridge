const {
  getCandidateById,
  updateCandidateById,
} = require("../services/candidateService");

const getMyProfile = async (req, res, next) => {
  try {
    const candidate = await getCandidateById(req.identity.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        candidate,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const candidate = await updateCandidateById(
      req.identity.candidateId,
      req.body
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Candidate profile updated successfully",
      data: {
        candidate,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};
