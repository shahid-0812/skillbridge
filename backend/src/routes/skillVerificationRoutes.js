const express = require("express");

const {
  createMyVerificationAttempt,
  startMyAssessment,
  submitMyAssessment,
  getMyVerificationStatus,
} = require("../controllers/skillVerificationController");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

router.use(authenticate, authorizeCandidate);

// Create a new 5-question verification attempt
router.post(
  "/me/skills/:skillId/verify",
  createMyVerificationAttempt
);

// Start the assessment
router.post(
  "/me/skills/:skillId/verify/start",
  startMyAssessment
);

// Submit all 5 answers and calculate the result
router.post(
  "/me/skills/:skillId/verify/attempts/:attemptId/submit",
  submitMyAssessment
);

// Get current verification status
router.get(
  "/me/skills/:skillId/verify",
  getMyVerificationStatus
);

module.exports = router;