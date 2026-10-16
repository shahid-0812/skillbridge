const preferredWorkSettingService = require("../services/preferredWorkSettingService");

const getAvailablePreferredWorkSettings = async (req, res, next) => {
  try {
    const settings =
      await preferredWorkSettingService.getAvailablePreferredWorkSettings();

    return res.status(200).json({
      success: true,
      data: {
        settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyPreferredWorkSettings = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const settings =
      await preferredWorkSettingService.getCandidatePreferredWorkSettings(
        candidateId
      );

    return res.status(200).json({
      success: true,
      data: {
        settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addMyPreferredWorkSetting = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const settingId = Number(req.body.setting_id);

    if (!Number.isInteger(settingId) || settingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid setting_id is required",
      });
    }

    const setting =
      await preferredWorkSettingService.addCandidatePreferredWorkSetting({
        candidateId,
        settingId,
      });

    return res.status(201).json({
      success: true,
      message: "Preferred work setting added successfully",
      data: {
        setting,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteMyPreferredWorkSetting = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const settingId = Number(req.params.settingId);

    if (!Number.isInteger(settingId) || settingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid settingId",
      });
    }

    const setting =
      await preferredWorkSettingService.deleteCandidatePreferredWorkSetting({
        candidateId,
        settingId,
      });

    return res.status(200).json({
      success: true,
      message: "Preferred work setting removed successfully",
      data: {
        setting,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailablePreferredWorkSettings,
  getMyPreferredWorkSettings,
  addMyPreferredWorkSetting,
  deleteMyPreferredWorkSetting,
};