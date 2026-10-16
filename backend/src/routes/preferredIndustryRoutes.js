const express = require("express");

const {
  getAvailablePreferredIndustries,
  getMyPreferredIndustries,
  addMyPreferredIndustry,
  deleteMyPreferredIndustry,
} = require("../controllers/preferredIndustryController");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

// Get all available industries
router.get(
  "/preferred-industries",
  authenticate,
  authorizeCandidate,
  getAvailablePreferredIndustries
);

// Get industries selected by the logged-in candidate
router.get(
  "/me/preferred-industries",
  authenticate,
  authorizeCandidate,
  getMyPreferredIndustries
);

// Select a preferred industry
router.post(
  "/me/preferred-industries",
  authenticate,
  authorizeCandidate,
  addMyPreferredIndustry
);

// Remove a preferred industry
router.delete(
  "/me/preferred-industries/:industryId",
  authenticate,
  authorizeCandidate,
  deleteMyPreferredIndustry
);

module.exports = router;