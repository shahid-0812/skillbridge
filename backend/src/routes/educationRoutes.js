const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const {
  getMyEducation,
  addEducation,
  updateMyEducation,
  deleteMyEducation,
} = require("../controllers/educationController");

const router = express.Router();


router.get(
  "/me/education",
  authenticate,
  authorizeCandidate,
  getMyEducation
);


router.post(
  "/me/education",
  authenticate,
  authorizeCandidate,
  addEducation
);


router.put(
  "/me/education/:id",
  authenticate,
  authorizeCandidate,
  updateMyEducation
);


router.delete(
  "/me/education/:id",
  authenticate,
  authorizeCandidate,
  deleteMyEducation
);


module.exports = router;