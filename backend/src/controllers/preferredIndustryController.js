const preferredIndustryService = require("../services/preferredIndustryService");

const getAvailablePreferredIndustries = async (req, res, next) => {
  try {
    const industries =
      await preferredIndustryService.getAvailablePreferredIndustries();

    return res.status(200).json({
      success: true,
      data: {
        industries,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyPreferredIndustries = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const industries =
      await preferredIndustryService.getCandidatePreferredIndustries(
        candidateId
      );

    return res.status(200).json({
      success: true,
      data: {
        industries,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addMyPreferredIndustry = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const industryId = Number(req.body.industry_id);

    if (!Number.isInteger(industryId) || industryId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid industry_id is required",
      });
    }

    const industry =
      await preferredIndustryService.addCandidatePreferredIndustry({
        candidateId,
        industryId,
      });

    return res.status(201).json({
      success: true,
      message: "Preferred industry added successfully",
      data: {
        industry,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteMyPreferredIndustry = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const industryId = Number(req.params.industryId);

    if (!Number.isInteger(industryId) || industryId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid industryId",
      });
    }

    const industry =
      await preferredIndustryService.deleteCandidatePreferredIndustry({
        candidateId,
        industryId,
      });

    return res.status(200).json({
      success: true,
      message: "Preferred industry removed successfully",
      data: {
        industry,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailablePreferredIndustries,
  getMyPreferredIndustries,
  addMyPreferredIndustry,
  deleteMyPreferredIndustry,
};