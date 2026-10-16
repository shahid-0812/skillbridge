const express = require("express");

const {
    applyToJob,
    getMyApplications,
    getMyApplicationById
} = require("../controllers/applicationController");

const authenticate = require("../middleware/authMiddleware");

const {
    authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

/*
 * Candidate applies to a job
 *
 * POST /api/candidate/applications
 */
router.post(
    "/",
    authenticate,
    authorizeCandidate,
    applyToJob
);

/*
 * Get all applications of logged-in candidate
 *
 * GET /api/candidate/applications
 */
router.get(
    "/",
    authenticate,
    authorizeCandidate,
    getMyApplications
);

/*
 * Get one application of logged-in candidate
 *
 * GET /api/candidate/applications/:applicationId
 */
router.get(
    "/:applicationId",
    authenticate,
    authorizeCandidate,
    getMyApplicationById
);

module.exports = router;