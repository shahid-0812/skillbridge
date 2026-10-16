const {
    createApplication,
    getCandidateApplications,
    getCandidateApplicationById
} = require("../services/applicationService");

/*
 * POST /api/candidate/applications
 */
const applyToJob = async (req, res, next) => {
    try {
        const { jobId } = req.body;

        // Validate jobId
        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "jobId is required",
            });
        }

        const parsedJobId = Number(jobId);

        if (
            !Number.isInteger(parsedJobId) ||
            parsedJobId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "jobId must be a valid positive integer",
            });
        }

        /*
         * authorizeCandidate resolves the candidate identity
         * from the logged-in user's JWT.
         */
        const candidateId = req.identity.candidateId;

        if (!candidateId) {
            return res.status(403).json({
                success: false,
                message: "Candidate profile not found",
            });
        }

        const application = await createApplication(
            candidateId,
            parsedJobId
        );

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: {
                application,
            },
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                ...(error.application
                    ? {
                          data: {
                              application: error.application,
                          },
                      }
                    : {}),
            });
        }

        next(error);
    }
};
/*
 * GET /api/candidate/applications
 */
const getMyApplications = async (req, res, next) => {
    try {
        const candidateId = req.identity.candidateId;

        if (!candidateId) {
            return res.status(403).json({
                success: false,
                message: "Candidate profile not found",
            });
        }

        const applications =
            await getCandidateApplications(candidateId);

        return res.status(200).json({
            success: true,
            data: {
                applications,
                count: applications.length,
            },
        });
    } catch (error) {
        next(error);
    }
};
/*
 * GET /api/candidate/applications/:applicationId
 */
const getMyApplicationById = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        const parsedApplicationId = Number(applicationId);

        if (
            !Number.isInteger(parsedApplicationId) ||
            parsedApplicationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "applicationId must be a valid positive integer",
            });
        }

        const candidateId = req.identity.candidateId;

        if (!candidateId) {
            return res.status(403).json({
                success: false,
                message: "Candidate profile not found",
            });
        }

        const application =
            await getCandidateApplicationById(
                candidateId,
                parsedApplicationId
            );

        return res.status(200).json({
            success: true,
            data: {
                application,
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
module.exports = {
    applyToJob,
    getMyApplications,
    getMyApplicationById
};