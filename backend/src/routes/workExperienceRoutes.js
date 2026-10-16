const express = require("express");

const {
  getMyWorkExperiences,
  addMyWorkExperience,
  updateMyWorkExperience,
  deleteMyWorkExperience,
} = require("../controllers/workExperienceController");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

router.get(
  "/me/work-experience",
  authenticate,
  authorizeCandidate,
  getMyWorkExperiences
);

router.post(
  "/me/work-experience",
  authenticate,
  authorizeCandidate,
  addMyWorkExperience
);

router.put(
  "/me/work-experience/:id",
  authenticate,
  authorizeCandidate,
  updateMyWorkExperience
);

router.delete(
  "/me/work-experience/:id",
  authenticate,
  authorizeCandidate,
  deleteMyWorkExperience
);

module.exports = router;
