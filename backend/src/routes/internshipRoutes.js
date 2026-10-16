const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const {
  getMyInternships,
  addMyInternship,
  updateMyInternship,
  deleteMyInternship,
} = require("../controllers/internshipController");

const router = express.Router();

router.get(
  "/me/internships",
  authenticate,
  authorizeCandidate,
  getMyInternships
);

router.post(
  "/me/internships",
  authenticate,
  authorizeCandidate,
  addMyInternship
);

router.put(
  "/me/internships/:id",
  authenticate,
  authorizeCandidate,
  updateMyInternship
);

router.delete(
  "/me/internships/:id",
  authenticate,
  authorizeCandidate,
  deleteMyInternship
);

module.exports = router;