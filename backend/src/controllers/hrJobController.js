const pool = require("../config/db");


const listCompanyJobs = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const result = await pool.query(
            `SELECT
                id, company_id, created_by, job_title, job_description,
                employment_type, work_setting, country, state, city,
                experience_min, experience_max, salary_min, salary_max,
                application_deadline, status, created_at, updated_at
             FROM jobs
             WHERE company_id = $1
             ORDER BY created_at DESC, id DESC`,
            [companyId]
        );

        return res.status(200).json({
            success: true,
            data: { jobs: result.rows },
        });
    } catch (error) {
        next(error);
    }
};

const createJob = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const createdBy = req.user.sub;

        const {
            jobTitle,
            jobDescription,
            employmentType,
            workSetting,
            country,
            state,
            city,
            experienceMin,
            experienceMax,
            salaryMin,
            salaryMax,
            applicationDeadline,
        } = req.body;

        // Required fields
        if (!jobTitle || !jobTitle.trim()) {
            return res.status(400).json({
                success: false,
                message: "Job title is required",
            });
        }

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                success: false,
                message: "Job description is required",
            });
        }

        const result = await pool.query(
            `INSERT INTO jobs (
                company_id,
                created_by,
                job_title,
                job_description,
                employment_type,
                work_setting,
                country,
                state,
                city,
                experience_min,
                experience_max,
                salary_min,
                salary_max,
                application_deadline,
                status
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7,
                $8, $9, $10, $11, $12, $13, $14, 'Draft'
            )
            RETURNING
                id,
                company_id,
                created_by,
                job_title,
                job_description,
                employment_type,
                work_setting,
                country,
                state,
                city,
                experience_min,
                experience_max,
                salary_min,
                salary_max,
                application_deadline,
                status,
                created_at,
                updated_at`,
            [
                companyId,
                createdBy,
                jobTitle.trim(),
                jobDescription.trim(),
                employmentType || null,
                workSetting || null,
                country || null,
                state || null,
                city || null,
                experienceMin ?? 0,
                experienceMax ?? null,
                salaryMin ?? null,
                salaryMax ?? null,
                applicationDeadline || null,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Job created successfully",
            data: {
                job: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};
const addJobSkill = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const jobId = req.params.jobId;

        const {
            skillId,
            requiredLevel,
            isRequired,
        } = req.body;

        if (!skillId) {
            return res.status(400).json({
                success: false,
                message: "Skill ID is required",
            });
        }

        if (
            !requiredLevel ||
            !["Basic", "Intermediate", "Advanced"].includes(requiredLevel)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Required level must be Basic, Intermediate or Advanced",
            });
        }

        // Make sure the job belongs to this HR user's company
        const jobResult = await pool.query(
            `SELECT id
             FROM jobs
             WHERE id = $1
             AND company_id = $2`,
            [jobId, companyId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // Make sure the skill exists
        const skillResult = await pool.query(
            `SELECT id, skill_name
             FROM skills_master
             WHERE id = $1`,
            [skillId]
        );

        if (skillResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        const result = await pool.query(
            `INSERT INTO job_skills (
                job_id,
                skill_id,
                required_level,
                is_required
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                job_id,
                skill_id,
                required_level,
                is_required,
                created_at`,
            [
                jobId,
                skillId,
                requiredLevel,
                isRequired !== false,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Job skill added successfully",
            data: {
                jobSkill: result.rows[0],
                skill: skillResult.rows[0],
            },
        });
    } catch (error) {
        // Duplicate skill for the same job
        if (error.code === "23505") {
            error.statusCode = 409;
            error.message = "This skill is already added to the job";
        }

        next(error);
    }
};
const getJobSkills = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const jobId = req.params.jobId;

        const jobResult = await pool.query(
            `SELECT id, job_title
             FROM jobs
             WHERE id = $1
             AND company_id = $2`,
            [jobId, companyId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        const result = await pool.query(
            `SELECT
                js.id,
                js.job_id,
                js.skill_id,
                sm.skill_name,
                js.required_level,
                js.is_required,
                js.created_at
             FROM job_skills js
             JOIN skills_master sm
                ON sm.id = js.skill_id
             WHERE js.job_id = $1
             ORDER BY js.id`,
            [jobId]
        );

        return res.status(200).json({
            success: true,
            data: {
                job: jobResult.rows[0],
                skills: result.rows,
            },
        });
    } catch (error) {
        next(error);
    }
};
const updateJobSkill = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const jobId = req.params.jobId;
        const jobSkillId = req.params.jobSkillId;

        const {
            requiredLevel,
            isRequired,
        } = req.body;

        if (
            !requiredLevel ||
            !["Basic", "Intermediate", "Advanced"].includes(requiredLevel)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Required level must be Basic, Intermediate or Advanced",
            });
        }

        // Make sure the job belongs to this HR user's company
        const jobResult = await pool.query(
            `SELECT id
             FROM jobs
             WHERE id = $1
             AND company_id = $2`,
            [jobId, companyId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        const result = await pool.query(
            `UPDATE job_skills
             SET
                required_level = $1,
                is_required = $2
             WHERE id = $3
             AND job_id = $4
             RETURNING
                id,
                job_id,
                skill_id,
                required_level,
                is_required,
                created_at`,
            [
                requiredLevel,
                isRequired !== false,
                jobSkillId,
                jobId,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job skill not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job skill updated successfully",
            data: {
                jobSkill: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};
const deleteJobSkill = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const jobId = req.params.jobId;
        const jobSkillId = req.params.jobSkillId;

        // Make sure the job belongs to this HR user's company
        const jobResult = await pool.query(
            `SELECT id
             FROM jobs
             WHERE id = $1
             AND company_id = $2`,
            [jobId, companyId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        const result = await pool.query(
            `DELETE FROM job_skills
             WHERE id = $1
             AND job_id = $2
             RETURNING id, job_id, skill_id`,
            [jobSkillId, jobId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job skill not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job skill deleted successfully",
            data: {
                jobSkill: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};
const createJobAssessment = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const createdBy = req.user.sub;
        const jobId = req.params.jobId;

        const {
            title,
            instructions,
            passingScore,
            durationMinutes,
        } = req.body;

        // Required title
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Assessment title is required",
            });
        }

        // Make sure the job belongs to this HR user's company
        const jobResult = await pool.query(
            `SELECT id, job_title
             FROM jobs
             WHERE id = $1
             AND company_id = $2`,
            [jobId, companyId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // One assessment per job
        const existingAssessment = await pool.query(
            `SELECT id
             FROM job_assessments
             WHERE job_id = $1`,
            [jobId]
        );

        if (existingAssessment.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An assessment already exists for this job",
            });
        }

        // Validate passing score
        const finalPassingScore =
            passingScore === undefined ? 70 : Number(passingScore);

        if (
            Number.isNaN(finalPassingScore) ||
            finalPassingScore < 0 ||
            finalPassingScore > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Passing score must be between 0 and 100",
            });
        }

        // Validate duration
        const finalDuration =
            durationMinutes === undefined
                ? 30
                : Number(durationMinutes);

        if (
            Number.isNaN(finalDuration) ||
            finalDuration <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Duration must be greater than 0 minutes",
            });
        }

        const result = await pool.query(
            `INSERT INTO job_assessments (
                job_id,
                title,
                instructions,
                passing_score,
                duration_minutes,
                status
            )
            VALUES ($1, $2, $3, $4, $5, 'Draft')
            RETURNING
                id,
                job_id,
                title,
                instructions,
                passing_score,
                duration_minutes,
                status,
                created_at,
                updated_at`,
            [
                jobId,
                title.trim(),
                instructions || null,
                finalPassingScore,
                finalDuration,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Job assessment created successfully",
            data: {
                assessment: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};
const addAssessmentQuestion = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const jobId = req.params.jobId;
        const assessmentId = req.params.assessmentId;

        const {
            questionText,
            questionType,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOption,
            marks,
            questionOrder,
        } = req.body;

        // Required question text
        if (!questionText || !questionText.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question text is required",
            });
        }

        // Currently we support MCQ
        const finalQuestionType = questionType || "MCQ";

        if (finalQuestionType !== "MCQ") {
            return res.status(400).json({
                success: false,
                message: "Only MCQ questions are supported currently",
            });
        }

        // Validate options
        if (!optionA || !optionB || !optionC || !optionD) {
            return res.status(400).json({
                success: false,
                message: "All four options are required",
            });
        }

        // Validate correct option
        if (!["A", "B", "C", "D"].includes(correctOption)) {
            return res.status(400).json({
                success: false,
                message:
                    "Correct option must be A, B, C or D",
            });
        }

        // Make sure assessment belongs to this company's job
        const assessmentResult = await pool.query(
            `SELECT
                ja.id,
                ja.job_id,
                ja.status
             FROM job_assessments ja
             JOIN jobs j
                ON j.id = ja.job_id
             WHERE ja.id = $1
             AND ja.job_id = $2
             AND j.company_id = $3`,
            [
                assessmentId,
                jobId,
                companyId,
            ]
        );

        if (assessmentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found",
            });
        }

        // Don't allow questions after publishing
        if (assessmentResult.rows[0].status === "Published") {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot add questions to a published assessment",
            });
        }

        const finalMarks =
            marks === undefined ? 1 : Number(marks);

        if (
            Number.isNaN(finalMarks) ||
            finalMarks <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Marks must be greater than 0",
            });
        }

        const finalQuestionOrder =
            questionOrder === undefined
                ? null
                : Number(questionOrder);

        if (
            finalQuestionOrder !== null &&
            (!Number.isInteger(finalQuestionOrder) ||
                finalQuestionOrder <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Question order must be a positive integer",
            });
        }

        const result = await pool.query(
            `INSERT INTO job_assessment_questions (
                assessment_id,
                question_text,
                question_type,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                marks,
                question_order
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10
            )
            RETURNING
                id,
                assessment_id,
                question_text,
                question_type,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                marks,
                question_order,
                created_at,
                updated_at`,
            [
                assessmentId,
                questionText.trim(),
                finalQuestionType,
                optionA.trim(),
                optionB.trim(),
                optionC.trim(),
                optionD.trim(),
                correctOption,
                finalMarks,
                finalQuestionOrder,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Assessment question added successfully",
            data: {
                question: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};
const getAssessmentQuestions = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const jobId = req.params.jobId;
        const assessmentId = req.params.assessmentId;

        // Verify assessment belongs to this company's job
        const assessmentResult = await pool.query(
            `SELECT
                ja.id,
                ja.job_id,
                ja.title,
                ja.status
             FROM job_assessments ja
             JOIN jobs j
                ON j.id = ja.job_id
             WHERE ja.id = $1
             AND ja.job_id = $2
             AND j.company_id = $3`,
            [assessmentId, jobId, companyId]
        );

        if (assessmentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found",
            });
        }

        const result = await pool.query(
            `SELECT
                id,
                assessment_id,
                question_text,
                question_type,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                marks,
                question_order,
                created_at,
                updated_at
             FROM job_assessment_questions
             WHERE assessment_id = $1
             ORDER BY
                question_order ASC NULLS LAST,
                id ASC`,
            [assessmentId]
        );

        return res.status(200).json({
            success: true,
            data: {
                assessment: assessmentResult.rows[0],
                questions: result.rows,
            },
        });
    } catch (error) {
        next(error);
    }
};
const updateAssessmentQuestion = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const jobId = req.params.jobId;
        const assessmentId = req.params.assessmentId;
        const questionId = req.params.questionId;

        const {
            questionText,
            questionType,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOption,
            marks,
            questionOrder,
        } = req.body;

        if (!questionText || !questionText.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question text is required",
            });
        }

        const finalQuestionType = questionType || "MCQ";

        if (finalQuestionType !== "MCQ") {
            return res.status(400).json({
                success: false,
                message: "Only MCQ questions are supported currently",
            });
        }

        if (!optionA || !optionB || !optionC || !optionD) {
            return res.status(400).json({
                success: false,
                message: "All four options are required",
            });
        }

        if (!["A", "B", "C", "D"].includes(correctOption)) {
            return res.status(400).json({
                success: false,
                message: "Correct option must be A, B, C or D",
            });
        }

        const assessmentResult = await pool.query(
            `SELECT
                ja.id,
                ja.status
             FROM job_assessments ja
             JOIN jobs j
                ON j.id = ja.job_id
             WHERE ja.id = $1
             AND ja.job_id = $2
             AND j.company_id = $3`,
            [assessmentId, jobId, companyId]
        );

        if (assessmentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found",
            });
        }

        if (assessmentResult.rows[0].status === "Published") {
            return res.status(400).json({
                success: false,
                message: "Cannot update a published assessment",
            });
        }

        const finalMarks =
            marks === undefined ? 1 : Number(marks);

        if (Number.isNaN(finalMarks) || finalMarks <= 0) {
            return res.status(400).json({
                success: false,
                message: "Marks must be greater than 0",
            });
        }

        const finalQuestionOrder =
            questionOrder === undefined
                ? null
                : Number(questionOrder);

        if (
            finalQuestionOrder !== null &&
            (!Number.isInteger(finalQuestionOrder) ||
                finalQuestionOrder <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Question order must be a positive integer",
            });
        }

        const result = await pool.query(
            `UPDATE job_assessment_questions
             SET
                question_text = $1,
                question_type = $2,
                option_a = $3,
                option_b = $4,
                option_c = $5,
                option_d = $6,
                correct_option = $7,
                marks = $8,
                question_order = $9,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $10
             AND assessment_id = $11
             RETURNING
                id,
                assessment_id,
                question_text,
                question_type,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                marks,
                question_order,
                created_at,
                updated_at`,
            [
                questionText.trim(),
                finalQuestionType,
                optionA.trim(),
                optionB.trim(),
                optionC.trim(),
                optionD.trim(),
                correctOption,
                finalMarks,
                finalQuestionOrder,
                questionId,
                assessmentId,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Assessment question updated successfully",
            data: {
                question: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};
const deleteAssessmentQuestion = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const jobId = req.params.jobId;
        const assessmentId = req.params.assessmentId;
        const questionId = req.params.questionId;

        // Verify assessment belongs to this company's job
        const assessmentResult = await pool.query(
            `SELECT
                ja.id,
                ja.status
             FROM job_assessments ja
             JOIN jobs j
                ON j.id = ja.job_id
             WHERE ja.id = $1
             AND ja.job_id = $2
             AND j.company_id = $3`,
            [assessmentId, jobId, companyId]
        );

        if (assessmentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found",
            });
        }

        if (assessmentResult.rows[0].status === "Published") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete questions from a published assessment",
            });
        }

        const result = await pool.query(
            `DELETE FROM job_assessment_questions
             WHERE id = $1
             AND assessment_id = $2
             RETURNING id, assessment_id`,
            [questionId, assessmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Assessment question deleted successfully",
            data: {
                question: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};
const publishJobAssessment = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const jobId = req.params.jobId;
        const assessmentId = req.params.assessmentId;

        // Verify assessment belongs to this company's job
        const assessmentResult = await pool.query(
            `SELECT
                ja.id,
                ja.job_id,
                ja.title,
                ja.passing_score,
                ja.duration_minutes,
                ja.status
             FROM job_assessments ja
             JOIN jobs j
                ON j.id = ja.job_id
             WHERE ja.id = $1
             AND ja.job_id = $2
             AND j.company_id = $3`,
            [assessmentId, jobId, companyId]
        );

        if (assessmentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found",
            });
        }

        const assessment = assessmentResult.rows[0];

        if (assessment.status === "Published") {
            return res.status(400).json({
                success: false,
                message: "Assessment is already published",
            });
        }

        // Make sure at least one question exists
        const questionResult = await pool.query(
            `SELECT COUNT(*)::INTEGER AS question_count
             FROM job_assessment_questions
             WHERE assessment_id = $1`,
            [assessmentId]
        );

        const questionCount =
            questionResult.rows[0].question_count;

        if (questionCount === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Assessment must have at least one question before publishing",
            });
        }

        // Publish assessment
        const result = await pool.query(
            `UPDATE job_assessments
             SET
                status = 'Published',
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING
                id,
                job_id,
                title,
                instructions,
                passing_score,
                duration_minutes,
                status,
                created_at,
                updated_at`,
            [assessmentId]
        );

        return res.status(200).json({
            success: true,
            message: "Assessment published successfully",
            data: {
                assessment: result.rows[0],
                questionCount,
            },
        });
    } catch (error) {
        next(error);
    }
};
const publishJob = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;
        const jobId = req.params.jobId;

        // 1. Check that the job belongs to this HR's company
        const jobResult = await pool.query(
            `SELECT
                j.id,
                j.company_id,
                j.job_title,
                j.status
             FROM jobs j
             WHERE j.id = $1
             AND j.company_id = $2`,
            [jobId, companyId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        const job = jobResult.rows[0];

        // 2. Don't publish an already published job
        if (job.status === "Published") {
            return res.status(400).json({
                success: false,
                message: "Job is already published",
            });
        }

        // 3. Make sure required skills exist
        const skillsResult = await pool.query(
            `SELECT COUNT(*)::INTEGER AS skill_count
             FROM job_skills
             WHERE job_id = $1
             AND is_required = TRUE`,
            [jobId]
        );

        const requiredSkillCount =
            skillsResult.rows[0].skill_count;

        if (requiredSkillCount === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Job must have at least one required skill before publishing",
            });
        }

        // 4. Make sure an assessment exists
        const assessmentResult = await pool.query(
            `SELECT
                id,
                status
             FROM job_assessments
             WHERE job_id = $1`,
            [jobId]
        );

        if (assessmentResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Job must have an assessment before publishing",
            });
        }

        const assessment = assessmentResult.rows[0];

        // 5. Assessment itself must already be published
        if (assessment.status !== "Published") {
            return res.status(400).json({
                success: false,
                message:
                    "Job assessment must be published before publishing the job",
            });
        }

        // 6. Make sure assessment has questions
        const questionResult = await pool.query(
            `SELECT COUNT(*)::INTEGER AS question_count
             FROM job_assessment_questions
             WHERE assessment_id = $1`,
            [assessment.id]
        );

        const questionCount =
            questionResult.rows[0].question_count;

        if (questionCount === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Job assessment must have at least one question",
            });
        }

        // 7. Publish the job
        const result = await pool.query(
            `UPDATE jobs
             SET
                status = 'Published',
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             AND company_id = $2
             RETURNING
                id,
                company_id,
                created_by,
                job_title,
                job_description,
                employment_type,
                work_setting,
                country,
                state,
                city,
                experience_min,
                experience_max,
                salary_min,
                salary_max,
                application_deadline,
                status,
                created_at,
                updated_at`,
            [jobId, companyId]
        );

        return res.status(200).json({
            success: true,
            message: "Job published successfully",
            data: {
                job: result.rows[0],
                requiredSkillCount,
                assessmentId: assessment.id,
                questionCount,
            },
        });
    } catch (error) {
        next(error);
    }
};
module.exports = {
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
};