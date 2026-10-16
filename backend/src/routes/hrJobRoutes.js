const express = require("express");

const {
    listCompanyJobs,
    createJob,
    addJobSkill,
    getJobSkills,
    updateJobSkill,
    deleteJobSkill,
    createJobAssessment,
    addAssessmentQuestion,
    getAssessmentQuestions,
    updateAssessmentQuestion,
    deleteAssessmentQuestion,
    publishJobAssessment,
    publishJob
} = require("../controllers/hrJobController");

const authenticate = require("../middleware/authMiddleware");

const {
    authorizeHR,
} = require("../middleware/hrAuthorizationMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorizeHR,
    listCompanyJobs
);

router.post(
    "/:jobId/skills",
    authenticate,
    authorizeHR,
    addJobSkill,
);
router.get(
    "/:jobId/skills",
    authenticate,
    authorizeHR,
    getJobSkills
);
router.put(
    "/:jobId/skills/:jobSkillId",
    authenticate,
    authorizeHR,
    updateJobSkill
);
router.delete(
    "/:jobId/skills/:jobSkillId",
    authenticate,
    authorizeHR,
    deleteJobSkill
);
router.post(
    "/",
    authenticate,
    authorizeHR,
    createJob
);

router.post(
    "/:jobId/assessment",
    authenticate,
    authorizeHR,
    createJobAssessment
);
router.post(
    "/:jobId/assessment/:assessmentId/questions",
    authenticate,
    authorizeHR,
    addAssessmentQuestion
);
router.get(
    "/:jobId/assessment/:assessmentId/questions",
    authenticate,
    authorizeHR,
    getAssessmentQuestions
);
router.put(
    "/:jobId/assessment/:assessmentId/questions/:questionId",
    authenticate,
    authorizeHR,
    updateAssessmentQuestion
);
router.delete(
    "/:jobId/assessment/:assessmentId/questions/:questionId",
    authenticate,
    authorizeHR,
    deleteAssessmentQuestion
);
router.post(
    "/:jobId/assessment/:assessmentId/publish",
    authenticate,
    authorizeHR,
    publishJobAssessment
);
router.post(
    "/:jobId/publish",
    authenticate,
    authorizeHR,
    publishJob
);
module.exports = router;