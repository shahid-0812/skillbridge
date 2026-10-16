const {
    startAssessment,
    getAssessmentQuestions,
    submitAssessment,
    getAssessmentResult
} = require("../services/applicationAssessmentService");

/*
 * POST /api/candidate/applications/:applicationId/assessment/start
 */
const startJobAssessment = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        const parsedApplicationId = Number(applicationId);

        if (
            !Number.isInteger(parsedApplicationId) ||
            parsedApplicationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "applicationId must be a valid positive integer",
            });
        }

        const candidateId = req.identity.candidateId;

        if (!candidateId) {
            return res.status(403).json({
                success: false,
                message: "Candidate profile not found",
            });
        }

        const result = await startAssessment(
            candidateId,
            parsedApplicationId
        );

        return res.status(201).json({
            success: true,
            message: result.resumed
                ? "Assessment resumed successfully"
                : "Assessment started successfully",
            data: {
                attempt: result.attempt,
                assessment: result.assessment,
                resumed: result.resumed,
            },
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        next(error);
    }
};
/*
 * GET /api/candidate/applications/:applicationId/assessment
 */
const getJobAssessmentQuestions = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        const parsedApplicationId = Number(applicationId);

        if (
            !Number.isInteger(parsedApplicationId) ||
            parsedApplicationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "applicationId must be a valid positive integer",
            });
        }

        const candidateId = req.identity.candidateId;

        if (!candidateId) {
            return res.status(403).json({
                success: false,
                message: "Candidate profile not found",
            });
        }

        const result = await getAssessmentQuestions(
            candidateId,
            parsedApplicationId
        );

        return res.status(200).json({
            success: true,
            data: {
                attempt: result.attempt,
                assessment: result.assessment,
                questions: result.questions,
            },
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        next(error);
    }
};
/*
 * POST /api/candidate/applications/:applicationId/assessment/submit
 */
const submitJobAssessment = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        const parsedApplicationId = Number(applicationId);

        if (
            !Number.isInteger(parsedApplicationId) ||
            parsedApplicationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "applicationId must be a valid positive integer",
            });
        }

        const candidateId = req.identity.candidateId;

        if (!candidateId) {
            return res.status(403).json({
                success: false,
                message: "Candidate profile not found",
            });
        }

        const { answers } = req.body;

        const result = await submitAssessment(
            candidateId,
            parsedApplicationId,
            answers
        );

        return res.status(200).json({
            success: true,
            message: "Assessment submitted successfully",
            data: {
                attempt: result.attempt,
                result: {
                    score: result.score,
                    totalMarks: result.totalMarks,
                    obtainedMarks: result.obtainedMarks,
                    passingScore: result.passingScore,
                    passed: result.passed,
                },
            },
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        next(error);
    }
};
/*
 * GET /api/candidate/applications/:applicationId/assessment/result
 */
const getJobAssessmentResult = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        const parsedApplicationId = Number(applicationId);

        if (
            !Number.isInteger(parsedApplicationId) ||
            parsedApplicationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "applicationId must be a valid positive integer",
            });
        }

        const candidateId = req.identity.candidateId;

        if (!candidateId) {
            return res.status(403).json({
                success: false,
                message: "Candidate profile not found",
            });
        }

        const result = await getAssessmentResult(
            candidateId,
            parsedApplicationId
        );

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        next(error);
    }
};
module.exports = {
    startJobAssessment,
    getJobAssessmentQuestions,
    submitJobAssessment,
    getJobAssessmentResult
};