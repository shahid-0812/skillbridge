const express = require("express");

const {
  getAvailablePreferredWorkSettings,
  getMyPreferredWorkSettings,
  addMyPreferredWorkSetting,
  deleteMyPreferredWorkSetting,
} = require("../controllers/preferredWorkSettingController");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

// Get all available work settings
router.get(
  "/preferred-work-settings",
  authenticate,
  authorizeCandidate,
  getAvailablePreferredWorkSettings
);

// Get work settings selected by the logged-in candidate
router.get(
  "/me/preferred-work-settings",
  authenticate,
  authorizeCandidate,
  getMyPreferredWorkSettings
);

// Select a preferred work setting
router.post(
  "/me/preferred-work-settings",
  authenticate,
  authorizeCandidate,
  addMyPreferredWorkSetting
);

// Remove a preferred work setting
router.delete(
  "/me/preferred-work-settings/:settingId",
  authenticate,
  authorizeCandidate,
  deleteMyPreferredWorkSetting
);

module.exports = router;