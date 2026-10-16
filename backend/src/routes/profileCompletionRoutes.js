const express = require("express");

const {
  getMyProfileCompletion,
} = require("../controllers/profileCompletionController");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

router.get(
  "/me/profile-completion",
  authenticate,
  authorizeCandidate,
  getMyProfileCompletion
);

module.exports = router;
