const express = require("express");

const {
  getAvailableTargetRoles,
  getMyTargetRoles,
  addMyTargetRole,
  deleteMyTargetRole,
} = require("../controllers/targetRoleController");

const authenticate = require("../middleware/authMiddleware");

const {
  authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

/*
 * Get all available target roles
 */
router.get(
  "/target-roles",
  authenticate,
  authorizeCandidate,
  getAvailableTargetRoles
);

/*
 * Get target roles selected by the candidate
 */
router.get(
  "/me/target-roles",
  authenticate,
  authorizeCandidate,
  getMyTargetRoles
);

/*
 * Add a target role
 */
router.post(
  "/me/target-roles",
  authenticate,
  authorizeCandidate,
  addMyTargetRole
);

/*
 * Remove a target role
 */
router.delete(
  "/me/target-roles/:roleId",
  authenticate,
  authorizeCandidate,
  deleteMyTargetRole
);

module.exports = router;