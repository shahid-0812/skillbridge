const pool = require("../config/db");
const { getMyApplications } = require("../controllers/applicationController");

/*
 * Create a new candidate application
 */
const createApplication = async (candidateId, jobId) => {
    // 1. Get published job + its published assessment
    const jobResult = await pool.query(
        `SELECT
            j.id,
            j.job_title,
            j.application_deadline,
            j.status AS job_status,
            ja.id AS assessment_id,
            ja.status AS assessment_status
         FROM jobs j
         LEFT JOIN job_assessments ja
            ON ja.job_id = j.id
         WHERE j.id = $1`,
        [jobId]
    );

    if (jobResult.rows.length === 0) {
        const error = new Error("Job not found");
        error.statusCode = 404;
        throw error;
    }

    const job = jobResult.rows[0];

    // 2. Job must be published
    if (job.job_status !== "Published") {
        const error = new Error(
            "You can only apply to published jobs"
        );
        error.statusCode = 400;
        throw error;
    }

    // 3. Check application deadline
    if (
        job.application_deadline &&
        new Date(job.application_deadline) < new Date()
    ) {
        const error = new Error(
            "The application deadline for this job has passed"
        );
        error.statusCode = 400;
        throw error;
    }

    // 4. Job must have a published assessment
    if (!job.assessment_id) {
        const error = new Error(
            "This job does not have an assessment"
        );
        error.statusCode = 400;
        throw error;
    }

    if (job.assessment_status !== "Published") {
        const error = new Error(
            "The assessment for this job is not available"
        );
        error.statusCode = 400;
        throw error;
    }

    // 5. Check whether candidate already applied
    const existingApplication = await pool.query(
        `SELECT
            id,
            status,
            applied_at
         FROM applications
         WHERE candidate_id = $1
           AND job_id = $2`,
        [candidateId, jobId]
    );

    if (existingApplication.rows.length > 0) {
        const existing = existingApplication.rows[0];

        const error = new Error(
            "You have already applied to this job"
        );
        error.statusCode = 409;
        error.application = existing;

        throw error;
    }

    // 6. Create application
    const applicationResult = await pool.query(
        `INSERT INTO applications (
            candidate_id,
            job_id,
            assessment_id,
            status
         )
         VALUES ($1, $2, $3, 'Assessment Pending')
         RETURNING
            id,
            candidate_id,
            job_id,
            assessment_id,
            status,
            assessment_score,
            applied_at,
            updated_at`,
        [
            candidateId,
            jobId,
            job.assessment_id,
        ]
    );

    return applicationResult.rows[0];
};

/*
 * Get all applications belonging to a candidate
 */
const getCandidateApplications = async (candidateId) => {
    const result = await pool.query(
        `SELECT
            a.id,
            a.candidate_id,
            a.job_id,
            a.assessment_id,
            a.status,
            a.assessment_score,
            a.applied_at,
            a.updated_at,

            j.job_title,
            j.job_description,
            j.employment_type,
            j.work_setting,
            j.country,
            j.state,
            j.city,
            j.application_deadline,

            c.id AS company_id,
            c.company_name,
            c.company_logo_url,
            c.industry,

            ja.title AS assessment_title,
            ja.passing_score,
            ja.duration_minutes,
            ja.status AS assessment_status

         FROM applications a

         JOIN jobs j
            ON j.id = a.job_id

         JOIN companies c
            ON c.id = j.company_id

         LEFT JOIN job_assessments ja
            ON ja.id = a.assessment_id

         WHERE a.candidate_id = $1

         ORDER BY a.applied_at DESC`,
        [candidateId]
    );

    return result.rows;
};

/*
 * Get one application belonging to a candidate
 */
const getCandidateApplicationById = async (
    candidateId,
    applicationId
) => {
    const result = await pool.query(
        `SELECT
            a.id,
            a.candidate_id,
            a.job_id,
            a.assessment_id,
            a.status,
            a.assessment_score,
            a.applied_at,
            a.updated_at,

            j.job_title,
            j.job_description,
            j.employment_type,
            j.work_setting,
            j.country,
            j.state,
            j.city,
            j.experience_min,
            j.experience_max,
            j.salary_min,
            j.salary_max,
            j.application_deadline,
            j.status AS job_status,

            c.id AS company_id,
            c.company_name,
            c.company_logo_url,
            c.industry,
            c.company_size,
            c.website_url,
            c.description AS company_description,

            ja.title AS assessment_title,
            ja.instructions AS assessment_instructions,
            ja.passing_score,
            ja.duration_minutes,
            ja.status AS assessment_status

         FROM applications a

         JOIN jobs j
            ON j.id = a.job_id

         JOIN companies c
            ON c.id = j.company_id

         LEFT JOIN job_assessments ja
            ON ja.id = a.assessment_id

         WHERE a.id = $1
           AND a.candidate_id = $2`,
        [applicationId, candidateId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Application not found");
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

module.exports = {
    createApplication,
    getCandidateApplications,
    getCandidateApplicationById
};