const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/candidateController");

const router = express.Router();

router.get(
  "/me",
  authenticate,
  authorizeCandidate,
  getMyProfile
);

router.put(
  "/me",
  authenticate,
  authorizeCandidate,
  updateMyProfile
);

module.exports = router;
