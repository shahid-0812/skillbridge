const express = require("express");

const {
  getAvailablePreferredLocations,
  getMyPreferredLocations,
  addMyPreferredLocation,
  deleteMyPreferredLocation,
} = require("../controllers/preferredLocationController");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

// Get all available locations from the master table
router.get(
  "/preferred-locations",
  authenticate,
  authorizeCandidate,
  getAvailablePreferredLocations
);

// Get locations selected by the logged-in candidate
router.get(
  "/me/preferred-locations",
  authenticate,
  authorizeCandidate,
  getMyPreferredLocations
);

// Select a preferred location
router.post(
  "/me/preferred-locations",
  authenticate,
  authorizeCandidate,
  addMyPreferredLocation
);

// Remove a preferred location
router.delete(
  "/me/preferred-locations/:locationId",
  authenticate,
  authorizeCandidate,
  deleteMyPreferredLocation
);

module.exports = router;