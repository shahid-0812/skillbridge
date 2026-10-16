const express = require("express");

const {
    startJobAssessment,
      getJobAssessmentQuestions,
      submitJobAssessment,
      getJobAssessmentResult
} = require("../controllers/applicationAssessmentController");

const authenticate = require("../middleware/authMiddleware");

const {
    authorizeCandidate,
} = require("../middleware/authorizationMiddleware");

const router = express.Router();

/*
 * Start job assessment
 *
 * POST /api/candidate/applications/:applicationId/assessment/start
 */
router.post(
    "/:applicationId/assessment/start",
    authenticate,
    authorizeCandidate,
    startJobAssessment
);
router.get(
    "/:applicationId/assessment",
    authenticate,
    authorizeCandidate,
    getJobAssessmentQuestions
);

router.post(
    "/:applicationId/assessment/submit",
    authenticate,
    authorizeCandidate,
    submitJobAssessment
);

/*
 * Get assessment result
 *
 * GET /api/candidate/applications/:applicationId/assessment/result
 */
router.get(
    "/:applicationId/assessment/result",
    authenticate,
    authorizeCandidate,
    getJobAssessmentResult
);
module.exports = router;