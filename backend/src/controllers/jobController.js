const pool = require("../config/db");

const getPublishedJobs = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT
                j.id,
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
                j.created_at,

                c.id AS company_id,
                c.company_name,
                c.company_logo_url,
                c.industry,
                c.company_size,
                c.website_url,

                ja.id AS assessment_id,
                ja.title AS assessment_title,
                ja.passing_score,
                ja.duration_minutes,
                ja.status AS assessment_status

             FROM jobs j

             JOIN companies c
                ON c.id = j.company_id

             LEFT JOIN job_assessments ja
                ON ja.job_id = j.id

             WHERE j.status = 'Published'

             AND (
                j.application_deadline IS NULL
                OR j.application_deadline >= CURRENT_DATE
             )

             ORDER BY j.created_at DESC`
        );

        const jobs = result.rows;

        // Get required skills for all returned jobs
        if (jobs.length > 0) {
            const jobIds = jobs.map((job) => job.id);

            const skillsResult = await pool.query(
                `SELECT
                    js.job_id,
                    js.skill_id,
                    js.required_level,
                    js.is_required,
                    sm.skill_name

                 FROM job_skills js

                 JOIN skills_master sm
                    ON sm.id = js.skill_id

                 WHERE js.job_id = ANY($1::int[])

                 ORDER BY js.job_id, js.is_required DESC, sm.skill_name`,
                [jobIds]
            );

            const skillsByJob = {};

            for (const skill of skillsResult.rows) {
                if (!skillsByJob[skill.job_id]) {
                    skillsByJob[skill.job_id] = [];
                }

                skillsByJob[skill.job_id].push({
                    skill_id: skill.skill_id,
                    skill_name: skill.skill_name,
                    required_level: skill.required_level,
                    is_required: skill.is_required,
                });
            }

            for (const job of jobs) {
                job.required_skills = skillsByJob[job.id] || [];
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                jobs,
                count: jobs.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPublishedJobs,
};