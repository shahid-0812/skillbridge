const express = require("express");

const {
  getMySkills,
  addMySkill,
  updateMySkill,
  deleteMySkill,
} = require("../controllers/candidateSkillController");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

router.get(
  "/me/skills",
  authenticate,
  authorizeCandidate,
  getMySkills
);

router.post(
  "/me/skills",
  authenticate,
  authorizeCandidate,
  addMySkill
);

router.put(
  "/me/skills/:skillId",
  authenticate,
  authorizeCandidate,
  updateMySkill
);

router.delete(
  "/me/skills/:skillId",
  authenticate,
  authorizeCandidate,
  deleteMySkill
);

module.exports = router;
