const express = require("express");

const {
  getMyProjects,
  addMyProject,
  updateMyProject,
  deleteMyProject,
} = require("../controllers/projectController");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

router.get(
  "/me/projects",
  authenticate,
  authorizeCandidate,
  getMyProjects
);

router.post(
  "/me/projects",
  authenticate,
  authorizeCandidate,
  addMyProject
);

router.put(
  "/me/projects/:id",
  authenticate,
  authorizeCandidate,
  updateMyProject
);

router.delete(
  "/me/projects/:id",
  authenticate,
  authorizeCandidate,
  deleteMyProject
);

module.exports = router;
