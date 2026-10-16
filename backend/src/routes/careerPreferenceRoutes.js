const express = require("express");

const {
  getMyCareerPreferences,
} = require("../controllers/careerPreferenceController");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

// Temporary compatibility endpoint.
// Actual career preferences are handled by:
// target roles, preferred locations,
// preferred work settings, and preferred industries.
router.get(
  "/me/career-preferences",
  authenticate,
  authorizeCandidate,
  getMyCareerPreferences
);

module.exports = router;