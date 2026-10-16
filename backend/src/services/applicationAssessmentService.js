const pool = require("../config/db");

/*
 * Start a job assessment for a candidate application
 */
const startAssessment = async (candidateId, applicationId) => {
  // 1. Get application + assessment details
  const applicationResult = await pool.query(
    `SELECT
            a.id AS application_id,
            a.candidate_id,
            a.job_id,
            a.assessment_id,
            a.status AS application_status,

            ja.title AS assessment_title,
            ja.instructions AS assessment_instructions,
            ja.passing_score,
            ja.duration_minutes,
            ja.status AS assessment_status

         FROM applications a

         LEFT JOIN job_assessments ja
            ON ja.id = a.assessment_id

         WHERE a.id = $1
           AND a.candidate_id = $2`,
    [applicationId, candidateId],
  );

  // 2. Application must exist and belong to candidate
  if (applicationResult.rows.length === 0) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  const application = applicationResult.rows[0];

  // 3. Application must have an assessment
  if (!application.assessment_id) {
    const error = new Error("This application does not have an assessment");
    error.statusCode = 400;
    throw error;
  }

  // 4. Assessment must be published
  if (application.assessment_status !== "Published") {
    const error = new Error("The assessment is not available");
    error.statusCode = 400;
    throw error;
  }


    // 5. Check whether any attempt has already been completed or expired
    const previousAttemptResult = await pool.query(
        `SELECT
            id,
            application_id,
            assessment_id,
            candidate_id,
            started_at,
            submitted_at,
            score,
            status
         FROM job_assessment_attempts
         WHERE application_id = $1
           AND candidate_id = $2
         ORDER BY started_at DESC`,
        [applicationId, candidateId]
    );

    const previousAttempts = previousAttemptResult.rows;

    // Never allow a retake after completion
    if (previousAttempts.some(
        (attempt) => attempt.status === "Completed"
    )) {
        const error = new Error(
            "You have already completed this assessment"
        );
        error.statusCode = 400;
        throw error;
    }

    // Never allow a retake after expiry
    if (previousAttempts.some(
        (attempt) => attempt.status === "Expired"
    )) {
        const error = new Error(
            "This assessment attempt has expired. Retakes are not allowed."
        );
        error.statusCode = 400;
        throw error;
    }

    // Resume the latest attempt if it is still active
    if (previousAttempts.length > 0) {
        const existingAttempt = previousAttempts[0];

        if (existingAttempt.status === "In Progress") {
            const startedAt = new Date(
                existingAttempt.started_at
            ).getTime();

            const durationMs =
                Number(application.duration_minutes) * 60 * 1000;

            const expiresAt = startedAt + durationMs;

            if (Date.now() >= expiresAt) {
                await pool.query(
                    `UPDATE job_assessment_attempts
                     SET
                        status = 'Expired',
                        updated_at = CURRENT_TIMESTAMP
                     WHERE id = $1
                       AND status = 'In Progress'`,
                    [existingAttempt.id]
                );

                const error = new Error(
                    "Assessment time has expired. This attempt can no longer be resumed."
                );
                error.statusCode = 400;
                throw error;
            }

            return {
                attempt: existingAttempt,
                assessment: {
                    id: application.assessment_id,
                    title: application.assessment_title,
                    instructions: application.assessment_instructions,
                    passing_score: application.passing_score,
                    duration_minutes: application.duration_minutes,
                },
                resumed: true,
            };
        }
    }

  // 7. Create a new attempt
  const attemptResult = await pool.query(
    `INSERT INTO job_assessment_attempts (
            application_id,
            assessment_id,
            candidate_id,
            status
         )
         VALUES ($1, $2, $3, 'In Progress')
         RETURNING
            id,
            application_id,
            assessment_id,
            candidate_id,
            started_at,
            submitted_at,
            score,
            status`,
    [applicationId, application.assessment_id, candidateId],
  );

  return {
    attempt: attemptResult.rows[0],
    assessment: {
      id: application.assessment_id,
      title: application.assessment_title,
      instructions: application.assessment_instructions,
      passing_score: application.passing_score,
      duration_minutes: application.duration_minutes,
    },
    resumed: false,
  };
};
/*
 * Get assessment questions for an active candidate attempt
 */
const getAssessmentQuestions = async (candidateId, applicationId) => {
  // 1. Verify application belongs to candidate
  const applicationResult = await pool.query(
    `SELECT
            a.id AS application_id,
            a.candidate_id,
            a.assessment_id,
            a.status AS application_status,

            ja.title AS assessment_title,
            ja.instructions AS assessment_instructions,
            ja.passing_score,
            ja.duration_minutes,
            ja.status AS assessment_status

         FROM applications a

         LEFT JOIN job_assessments ja
            ON ja.id = a.assessment_id

         WHERE a.id = $1
           AND a.candidate_id = $2`,
    [applicationId, candidateId],
  );

  if (applicationResult.rows.length === 0) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  const application = applicationResult.rows[0];

  // 2. Make sure assessment exists
  if (!application.assessment_id) {
    const error = new Error("This application does not have an assessment");
    error.statusCode = 400;
    throw error;
  }

  // 3. Assessment must be published
  if (application.assessment_status !== "Published") {
    const error = new Error("The assessment is not available");
    error.statusCode = 400;
    throw error;
  }

  // 4. Candidate must have an active attempt
  const attemptResult = await pool.query(
    `SELECT
            id,
            application_id,
            assessment_id,
            candidate_id,
            started_at,
            submitted_at,
            score,
            status
         FROM job_assessment_attempts
         WHERE application_id = $1
           AND assessment_id = $2
           AND candidate_id = $3
           AND status = 'In Progress'
         ORDER BY started_at DESC
         LIMIT 1`,
    [applicationId, application.assessment_id, candidateId],
  );

  if (attemptResult.rows.length === 0) {
    const error = new Error(
      "No active assessment attempt found. Please start the assessment first.",
    );
    error.statusCode = 400;
    throw error;
  }

  const attempt = attemptResult.rows[0];

  // 5. Get questions
  // IMPORTANT:
  // correct_option is intentionally NOT selected.
  const questionsResult = await pool.query(
    `SELECT
            id,
            question_text,
            question_type,
            option_a,
            option_b,
            option_c,
            option_d,
            marks,
            question_order
         FROM job_assessment_questions
         WHERE assessment_id = $1
         ORDER BY question_order ASC, id ASC`,
    [application.assessment_id],
  );

  if (questionsResult.rows.length === 0) {
    const error = new Error("No questions are available for this assessment");
    error.statusCode = 400;
    throw error;
  }

  return {
    attempt,
    assessment: {
      id: application.assessment_id,
      title: application.assessment_title,
      instructions: application.assessment_instructions,
      passing_score: application.passing_score,
      duration_minutes: application.duration_minutes,
    },
    questions: questionsResult.rows,
  };
};
/*
 * Submit a job assessment
 */
const submitAssessment = async (candidateId, applicationId, answers) => {
  // 1. Verify application belongs to candidate
  const applicationResult = await pool.query(
    `SELECT
            a.id AS application_id,
            a.candidate_id,
            a.assessment_id,
            a.status AS application_status,

            ja.title AS assessment_title,
            ja.passing_score,
            ja.duration_minutes,
            ja.status AS assessment_status

         FROM applications a

         LEFT JOIN job_assessments ja
            ON ja.id = a.assessment_id

         WHERE a.id = $1
           AND a.candidate_id = $2`,
    [applicationId, candidateId],
  );

  if (applicationResult.rows.length === 0) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  const application = applicationResult.rows[0];

  // 2. Assessment must exist
  if (!application.assessment_id) {
    const error = new Error("This application does not have an assessment");
    error.statusCode = 400;
    throw error;
  }

  // 3. Assessment must be published
  if (application.assessment_status !== "Published") {
    const error = new Error("The assessment is not available");
    error.statusCode = 400;
    throw error;
  }

  // 4. Find active attempt
  const attemptResult = await pool.query(
    `SELECT
            id,
            application_id,
            assessment_id,
            candidate_id,
            started_at,
            submitted_at,
            score,
            status
         FROM job_assessment_attempts
         WHERE application_id = $1
           AND assessment_id = $2
           AND candidate_id = $3
           AND status = 'In Progress'
         ORDER BY started_at DESC
         LIMIT 1`,
    [applicationId, application.assessment_id, candidateId],
  );

  if (attemptResult.rows.length === 0) {
    // Check whether the candidate already completed it
    const completedAttemptResult = await pool.query(
      `SELECT id
             FROM job_assessment_attempts
             WHERE application_id = $1
               AND assessment_id = $2
               AND candidate_id = $3
               AND status = 'Completed'
             ORDER BY submitted_at DESC
             LIMIT 1`,
      [applicationId, application.assessment_id, candidateId],
    );

    if (completedAttemptResult.rows.length > 0) {
      const error = new Error("You have already completed this assessment");
      error.statusCode = 400;
      throw error;
    }

    // No active or completed attempt exists
    const error = new Error("No active assessment attempt found");
    error.statusCode = 400;
    throw error;
  }

  const attempt = attemptResult.rows[0];

  // Check the server-side assessment time limit
  const startedAt = new Date(attempt.started_at).getTime();
  const durationMs = Number(application.duration_minutes) * 60 * 1000;

  const expiresAt = startedAt + durationMs;
  const currentTime = Date.now();

  if (currentTime >= expiresAt) {
    await pool.query(
      `UPDATE job_assessment_attempts
         SET
            status = 'Expired',
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND status = 'In Progress'`,
      [attempt.id],
    );

    const error = new Error(
      "Assessment time has expired. Submission is no longer allowed.",
    );
    error.statusCode = 400;
    throw error;
  }

  // 5. Validate answers array
  if (!Array.isArray(answers) || answers.length === 0) {
    const error = new Error("Answers must be a non-empty array");
    error.statusCode = 400;
    throw error;
  }

  // 6. Get all assessment questions INCLUDING correct answers.
  // This query is server-side only.
  const questionsResult = await pool.query(
    `SELECT
            id,
            correct_option,
            marks
         FROM job_assessment_questions
         WHERE assessment_id = $1
         ORDER BY question_order ASC, id ASC`,
    [application.assessment_id],
  );

  const questions = questionsResult.rows;

  if (questions.length === 0) {
    const error = new Error("No questions are available for this assessment");
    error.statusCode = 400;
    throw error;
  }

  // 7. Candidate must submit exactly one answer per question
  if (answers.length !== questions.length) {
    const error = new Error(`Exactly ${questions.length} answers are required`);
    error.statusCode = 400;
    throw error;
  }

  // 8. Create a map of submitted answers
  const submittedAnswers = new Map();

  for (const answer of answers) {
    const questionId = Number(answer.questionId);
    const selectedOption = answer.selectedOption;

    if (!Number.isInteger(questionId) || questionId <= 0) {
      const error = new Error("Each answer must contain a valid questionId");
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof selectedOption !== "string" ||
      !["A", "B", "C", "D"].includes(selectedOption.toUpperCase())
    ) {
      const error = new Error("selectedOption must be A, B, C or D");
      error.statusCode = 400;
      throw error;
    }

    if (submittedAnswers.has(questionId)) {
      const error = new Error(
        "Duplicate answers for the same question are not allowed",
      );
      error.statusCode = 400;
      throw error;
    }

    submittedAnswers.set(questionId, selectedOption.toUpperCase());
  }

  // 9. Calculate score
  let totalMarks = 0;
  let obtainedMarks = 0;

  const evaluatedAnswers = [];

  for (const question of questions) {
    const questionId = Number(question.id);
    const selectedOption = submittedAnswers.get(questionId);

    // Make sure every actual question was answered
    if (!selectedOption) {
      const error = new Error(`Answer missing for question ${questionId}`);
      error.statusCode = 400;
      throw error;
    }

    const marks = Number(question.marks) || 0;
    const isCorrect = selectedOption === question.correct_option;

    totalMarks += marks;

    if (isCorrect) {
      obtainedMarks += marks;
    }

    evaluatedAnswers.push({
      questionId,
      selectedOption,
      isCorrect,
      marksObtained: isCorrect ? marks : 0,
    });
  }

  // 10. Convert marks to percentage
  const score =
    totalMarks > 0
      ? Number(((obtainedMarks / totalMarks) * 100).toFixed(2))
      : 0;

  const passingScore = Number(application.passing_score);

  const passed = score >= passingScore;

  // 11. Save everything in a transaction
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Save individual answers
    for (const answer of evaluatedAnswers) {
      await client.query(
        `INSERT INTO job_assessment_answers (
                    attempt_id,
                    question_id,
                    selected_option,
                    is_correct,
                    marks_obtained
                 )
                 VALUES ($1, $2, $3, $4, $5)`,
        [
          attempt.id,
          answer.questionId,
          answer.selectedOption,
          answer.isCorrect,
          answer.marksObtained,
        ],
      );
    }

    // Complete attempt
    const updatedAttemptResult = await client.query(
      `UPDATE job_assessment_attempts
             SET
                submitted_at = CURRENT_TIMESTAMP,
                score = $1,
                status = 'Completed',
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING
                id,
                application_id,
                assessment_id,
                candidate_id,
                started_at,
                submitted_at,
                score,
                status`,
      [score, attempt.id],
    );

    // Update application status
    await client.query(
      `UPDATE applications
             SET
                status = 'Assessment Completed',
                assessment_score = $1,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
      [score, applicationId],
    );

    await client.query("COMMIT");

    return {
      attempt: updatedAttemptResult.rows[0],
      score,
      totalMarks,
      obtainedMarks,
      passingScore,
      passed,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
/*
 * Get completed assessment result
 */
const getAssessmentResult = async (candidateId, applicationId) => {
  // 1. Verify application belongs to candidate
  const applicationResult = await pool.query(
    `SELECT
            a.id AS application_id,
            a.candidate_id,
            a.job_id,
            a.assessment_id,
            a.status AS application_status,
            a.assessment_score,

            ja.title AS assessment_title,
            ja.passing_score,
            ja.duration_minutes,
            ja.status AS assessment_status

         FROM applications a

         LEFT JOIN job_assessments ja
            ON ja.id = a.assessment_id

         WHERE a.id = $1
           AND a.candidate_id = $2`,
    [applicationId, candidateId],
  );

  if (applicationResult.rows.length === 0) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  const application = applicationResult.rows[0];

  // 2. Assessment must exist
  if (!application.assessment_id) {
    const error = new Error("This application does not have an assessment");
    error.statusCode = 400;
    throw error;
  }

  // 3. Find completed attempt
  const attemptResult = await pool.query(
    `SELECT
            id,
            application_id,
            assessment_id,
            candidate_id,
            started_at,
            submitted_at,
            score,
            status
         FROM job_assessment_attempts
         WHERE application_id = $1
           AND assessment_id = $2
           AND candidate_id = $3
           AND status = 'Completed'
         ORDER BY submitted_at DESC
         LIMIT 1`,
    [applicationId, application.assessment_id, candidateId],
  );
  if (attemptResult.rows.length === 0) {
    const error = new Error("Assessment has not been completed yet");
    error.statusCode = 400;
    throw error;
  }

  const attempt = attemptResult.rows[0];

  const score = Number(attempt.score) || 0;
  const passingScore = Number(application.passing_score) || 0;

  const passed = score >= passingScore;

  return {
    application: {
      id: application.application_id,
      job_id: application.job_id,
      status: application.application_status,
      assessment_score: application.assessment_score,
    },

    assessment: {
      id: application.assessment_id,
      title: application.assessment_title,
      passing_score: passingScore,
      duration_minutes: application.duration_minutes,
    },

    attempt: {
      id: attempt.id,
      started_at: attempt.started_at,
      submitted_at: attempt.submitted_at,
      score,
      status: attempt.status,
    },

    result: {
      score,
      passingScore,
      passed,
    },
  };
};
module.exports = {
  startAssessment,
  getAssessmentQuestions,
  submitAssessment,
  getAssessmentResult,
};
