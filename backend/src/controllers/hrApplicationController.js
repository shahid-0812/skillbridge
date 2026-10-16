const pool = require("../config/db");

/*
 * GET /api/hr/applications?jobId=123
 * Returns applications belonging only to the authenticated HR user's company.
 */
const getCompanyApplications = async (req, res, next) => {
  try {
    const companyId = req.companyMember.company_id;
    const rawJobId = req.query.jobId;
    let jobId = null;

    if (rawJobId !== undefined) {
      jobId = Number(rawJobId);
      if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({
          success: false,
          message: "jobId must be a valid positive integer",
        });
      }
    }

    let job = null;
    if (jobId !== null) {
      const jobResult = await pool.query(
        `SELECT id, job_title, status, company_id
         FROM jobs
         WHERE id = $1 AND company_id = $2`,
        [jobId, companyId]
      );

      if (jobResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Job not found for this company",
        });
      }
      job = jobResult.rows[0];
    }

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
         j.city AS job_city,

         u.first_name,
         u.last_name,
         u.email,

         c.profile_photo_url,
         c.professional_headline,
         c.phone_number,
         c.country,
         c.state,
         c.city,

         ja.title AS assessment_title,
         ja.passing_score,
         ja.duration_minutes,
         ja.status AS assessment_status,

         latest_attempt.score AS latest_attempt_score,
         latest_attempt.status AS latest_attempt_status,
         latest_attempt.started_at AS latest_attempt_started_at,
         latest_attempt.submitted_at AS latest_attempt_submitted_at,

         co.company_name

       FROM applications a
       JOIN jobs j
         ON j.id = a.job_id
       JOIN candidates c
         ON c.id = a.candidate_id
       JOIN users u
         ON u.id = c.user_id
       JOIN companies co
         ON co.id = j.company_id
       LEFT JOIN job_assessments ja
         ON ja.id = a.assessment_id
       LEFT JOIN LATERAL (
         SELECT at.score, at.status, at.started_at, at.submitted_at
         FROM job_assessment_attempts at
         WHERE at.application_id = a.id
           AND at.candidate_id = a.candidate_id
         ORDER BY at.started_at DESC
         LIMIT 1
       ) latest_attempt ON TRUE

       WHERE j.company_id = $1
         AND ($2::integer IS NULL OR a.job_id = $2)
       ORDER BY a.applied_at DESC, a.id DESC`,
      [companyId, jobId]
    );

    const companyResult = await pool.query(
      `SELECT id, company_name FROM companies WHERE id = $1`,
      [companyId]
    );

    return res.status(200).json({
      success: true,
      data: {
        applications: result.rows,
        count: result.rows.length,
        job,
        company: companyResult.rows[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCompanyApplications };
