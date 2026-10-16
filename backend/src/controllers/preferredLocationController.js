const preferredLocationService = require("../services/preferredLocationService");

const getAvailablePreferredLocations = async (req, res, next) => {
  try {
    const locations =
      await preferredLocationService.getAvailablePreferredLocations();

    return res.status(200).json({
      success: true,
      data: {
        locations,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyPreferredLocations = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const locations =
      await preferredLocationService.getCandidatePreferredLocations(
        candidateId
      );

    return res.status(200).json({
      success: true,
      data: {
        locations,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addMyPreferredLocation = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const locationId = Number(req.body.location_id);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid location_id is required",
      });
    }

    const location =
      await preferredLocationService.addCandidatePreferredLocation({
        candidateId,
        locationId,
      });

    return res.status(201).json({
      success: true,
      message: "Preferred location added successfully",
      data: {
        location,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteMyPreferredLocation = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const locationId = Number(req.params.locationId);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid locationId",
      });
    }

    const location =
      await preferredLocationService.deleteCandidatePreferredLocation({
        candidateId,
        locationId,
      });

    return res.status(200).json({
      success: true,
      message: "Preferred location removed successfully",
      data: {
        location,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailablePreferredLocations,
  getMyPreferredLocations,
  addMyPreferredLocation,
  deleteMyPreferredLocation,
};