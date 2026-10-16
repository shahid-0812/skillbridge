const pool = require("../config/db");
const {
  getQuestionsForSkill,
} = require("./skillQuestionBank");

const ALLOWED_LEVELS = ["Basic", "Intermediate", "Advanced"];

const ASSESSMENT_TIME_LIMIT_MINUTES = 35;

const getSkillForCandidate = async (candidateId, skillId) => {
  const result = await pool.query(
    `SELECT
        cs.id AS candidate_skill_id,
        cs.candidate_id,
        cs.skill_id,
        cs.claimed_level,
        cs.verified_score,
        cs.verified_level,
        cs.verification_status,
        sm.skill_name
     FROM candidate_skills cs
     INNER JOIN skills_master sm
       ON sm.id = cs.skill_id
     WHERE cs.candidate_id = $1
       AND cs.skill_id = $2
     LIMIT 1`,
    [candidateId, skillId]
  );

  return result.rows[0] || null;
};

const getLatestAttempt = async (candidateId, skillId) => {
  const result = await pool.query(
    `SELECT *
     FROM skill_verification_attempts
     WHERE candidate_id = $1
       AND skill_id = $2
     ORDER BY id DESC
     LIMIT 1`,
    [candidateId, skillId]
  );

  return result.rows[0] || null;
};

const calculateVerifiedLevel = (score) => {
  if (score >= 70) {
    return "Advanced";
  }

  if (score >= 40) {
    return "Intermediate";
  }

  return "Basic";
};

const createVerificationAttempt = async ({
  candidateId,
  skillId,
}) => {
  const candidateSkill = await getSkillForCandidate(
    candidateId,
    skillId
  );

  if (!candidateSkill) {
    const error = new Error(
      "This skill is not selected by the candidate"
    );
    error.statusCode = 404;
    throw error;
  }

  if (!ALLOWED_LEVELS.includes(candidateSkill.claimed_level)) {
    const error = new Error(
      "Invalid claimed skill level"
    );
    error.statusCode = 400;
    throw error;
  }

  const questions = getQuestionsForSkill(skillId);

  if (!questions) {
    const error = new Error(
      "Assessment is not available for this skill yet"
    );
    error.statusCode = 404;
    throw error;
  }

  if (questions.length !== 5) {
    const error = new Error(
      "Assessment must contain exactly 5 questions"
    );
    error.statusCode = 500;
    throw error;
  }

// Check for an existing active attempt.
const activeAttempt = await pool.query(
  `SELECT id, status, started_at
   FROM skill_verification_attempts
   WHERE candidate_id = $1
     AND skill_id = $2
     AND status IN ('Created', 'Started')
   ORDER BY id DESC
   LIMIT 1`,
  [candidateId, skillId]
);

if (activeAttempt.rows.length > 0) {
  const existingAttempt = activeAttempt.rows[0];

  // A Started attempt can expire based on the server-side timer.
  if (existingAttempt.status === "Started") {
    const startedAt = new Date(existingAttempt.started_at);
    const now = new Date();

    const elapsedMinutes =
      (now.getTime() - startedAt.getTime()) / (1000 * 60);

    if (elapsedMinutes > ASSESSMENT_TIME_LIMIT_MINUTES) {
      await pool.query(
        `UPDATE skill_verification_attempts
         SET status = 'Expired',
             submitted_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND status = 'Started'`,
        [existingAttempt.id]
      );
    } else {
      const error = new Error(
        "An assessment is already in progress"
      );
      error.statusCode = 409;
      throw error;
    }
  } else {
    // A Created attempt has not started yet.
    const error = new Error(
      "An assessment is already in progress"
    );
    error.statusCode = 409;
    throw error;
  }
}


  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const attemptResult = await client.query(
      `INSERT INTO skill_verification_attempts (
          candidate_id,
          skill_id,
          status
       )
       VALUES ($1, $2, 'Created')
       RETURNING *`,
      [candidateId, skillId]
    );

    const attempt = attemptResult.rows[0];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

     

     

      await client.query(
        `INSERT INTO skill_assessment_questions (
            attempt_id,
            question_number,
            question_text,
            description,
            question_type,
            options,
            correct_option
         )
         VALUES ($1, $2, $3, $4, 'scenario', $5, $6)`,
        [
          attempt.id,
          i + 1,
          question.question_text,
          question.description || null,
          JSON.stringify(question.options),
          question.correct_option,
        ]
      );
    }

    await client.query("COMMIT");

    return {
      attempt,
      questionCount: questions.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const startAssessment = async ({
  candidateId,
  skillId,
}) => {
  const attempt = await getLatestAttempt(
    candidateId,
    skillId
  );

  if (!attempt) {
    const error = new Error(
      "No assessment attempt found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (attempt.status === "Started") {
    return {
      attempt,
      questions: await getQuestionsForCandidate(attempt.id),
    };
  }

  if (attempt.status !== "Created") {
    const error = new Error(
      `Assessment cannot be started from status ${attempt.status}`
    );
    error.statusCode = 409;
    throw error;
  }

  const result = await pool.query(
    `UPDATE skill_verification_attempts
     SET status = 'Started',
         started_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [attempt.id]
  );

  return {
    attempt: result.rows[0],
    questions: await getQuestionsForCandidate(attempt.id),
  };
};

const getQuestionsForCandidate = async (attemptId) => {
  const result = await pool.query(
    `SELECT
        id,
        question_number,
        question_text,
        description,
        question_type,
        options
     FROM skill_assessment_questions
     WHERE attempt_id = $1
     ORDER BY question_number`,
    [attemptId]
  );

  return result.rows;
};

const submitAssessment = async ({
  candidateId,
  skillId,
  attemptId,
  answers,
}) => {
  if (!Array.isArray(answers) || answers.length !== 5) {
    const error = new Error(
      "Exactly 5 answers are required"
    );
    error.statusCode = 400;
    throw error;
  }

  const answerMap = new Map();

  for (const answer of answers) {
    const questionNumber = Number(answer.question_number);
    const selectedOption = answer.selected_option;

    if (
      !Number.isInteger(questionNumber) ||
      questionNumber < 1 ||
      questionNumber > 5
    ) {
      const error = new Error(
        "Invalid question number"
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof selectedOption !== "string" ||
      selectedOption.trim() === ""
    ) {
      const error = new Error(
        `Answer missing for question ${questionNumber}`
      );
      error.statusCode = 400;
      throw error;
    }

    if (answerMap.has(questionNumber)) {
      const error = new Error(
        `Duplicate answer for question ${questionNumber}`
      );
      error.statusCode = 400;
      throw error;
    }

    answerMap.set(questionNumber, selectedOption);
  }

  if (answerMap.size !== 5) {
    const error = new Error(
      "Every question must have exactly one answer"
    );
    error.statusCode = 400;
    throw error;
  }

  let correctCount = 0;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
     * Lock the exact assessment attempt.
     *
     * This prevents two simultaneous submissions
     * from completing the same attempt.
     */
    const attemptResult = await client.query(
      `SELECT
          id,
          candidate_id,
          skill_id,
          status,
          started_at
       FROM skill_verification_attempts
       WHERE id = $1
         AND candidate_id = $2
         AND skill_id = $3
       FOR UPDATE`,
      [attemptId, candidateId, skillId]
    );

    const attempt = attemptResult.rows[0] || null;

    if (!attempt) {
      const error = new Error(
        "Assessment attempt not found"
      );
      error.statusCode = 404;
      throw error;
    }

    if (attempt.status !== "Started") {
      const error = new Error(
        `Assessment cannot be submitted from status ${attempt.status}`
      );
      error.statusCode = 409;
      throw error;
    }

    /*
     * Server-side time limit check.
     */
    const startedAt = new Date(attempt.started_at);
    const now = new Date();

    const elapsedMinutes =
      (now.getTime() - startedAt.getTime()) /
      (1000 * 60);

    if (elapsedMinutes > ASSESSMENT_TIME_LIMIT_MINUTES) {
      await client.query(
        `UPDATE skill_verification_attempts
         SET status = 'Expired',
             submitted_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND status = 'Started'`,
        [attempt.id]
      );

      const error = new Error(
        "Assessment time limit has expired"
      );
      error.statusCode = 409;
      throw error;
    }

    /*
     * Load the questions belonging to THIS attempt.
     */
    const questionsResult = await client.query(
      `SELECT
          id,
          question_number,
          options,
          correct_option
       FROM skill_assessment_questions
       WHERE attempt_id = $1
       ORDER BY question_number`,
      [attempt.id]
    );

    const questions = questionsResult.rows;

    if (questions.length !== 5) {
      const error = new Error(
        "Assessment does not contain exactly 5 questions"
      );
      error.statusCode = 500;
      throw error;
    }

    /*
     * Score answers on the server.
     */
    for (const question of questions) {
      const selectedOption = answerMap.get(
        question.question_number
      );

      if (!question.options.includes(selectedOption)) {
        const error = new Error(
          `Invalid answer option for question ${question.question_number}`
        );
        error.statusCode = 400;
        throw error;
      }

      const isCorrect =
        selectedOption === question.correct_option;

      if (isCorrect) {
        correctCount++;
      }

      await client.query(
        `UPDATE skill_assessment_questions
         SET candidate_answer = $1,
             is_correct = $2
         WHERE id = $3`,
        [
          selectedOption,
          isCorrect,
          question.id,
        ]
      );
    }

    const score = correctCount * 20;

    const verifiedLevel =
      calculateVerifiedLevel(score);

    /*
     * Mark the exact attempt as completed.
     */
    await client.query(
      `UPDATE skill_verification_attempts
       SET status = 'Completed',
           submitted_at = CURRENT_TIMESTAMP,
           completed_at = CURRENT_TIMESTAMP,
           score = $1,
           verified_level = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
         AND status = 'Started'`,
      [
        score,
        verifiedLevel,
        attempt.id,
      ]
    );

    /*
     * Update the candidate's verified skill.
     */
    await client.query(
      `UPDATE candidate_skills
       SET verified_score = $1,
           verified_level = $2,
           verification_status = 'Verified',
           updated_at = CURRENT_TIMESTAMP
       WHERE candidate_id = $3
         AND skill_id = $4`,
      [
        score,
        verifiedLevel,
        candidateId,
        skillId,
      ]
    );

    await client.query("COMMIT");

    return {
      attemptId: attempt.id,
      score,
      correctAnswers: correctCount,
      totalQuestions: 5,
      verifiedLevel,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const getVerificationStatus = async ({
  candidateId,
  skillId,
}) => {
  const candidateSkill = await getSkillForCandidate(
    candidateId,
    skillId
  );

  if (!candidateSkill) {
    const error = new Error(
      "Candidate skill not found"
    );
    error.statusCode = 404;
    throw error;
  }

  let attempt = await getLatestAttempt(
    candidateId,
    skillId
  );

  /*
   * Automatically expire a Started attempt
   * when the 35-minute server-side limit has passed.
   */
  if (
    attempt &&
    attempt.status === "Started" &&
    attempt.started_at
  ) {
    const startedAt = new Date(attempt.started_at);
    const now = new Date();

    const elapsedMinutes =
      (now.getTime() - startedAt.getTime()) /
      (1000 * 60);

    if (elapsedMinutes > ASSESSMENT_TIME_LIMIT_MINUTES) {
      const expiredResult = await pool.query(
        `UPDATE skill_verification_attempts
         SET status = 'Expired',
             submitted_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND status = 'Started'
         RETURNING
           id,
           candidate_id,
           skill_id,
           status,
           started_at,
           submitted_at,
           completed_at,
           score,
           verified_level,
           created_at,
           updated_at`,
        [attempt.id]
      );

      if (expiredResult.rows.length > 0) {
        attempt = expiredResult.rows[0];
      }
    }
  }

  let questions = [];

  if (attempt) {
    questions = await getQuestionsForCandidate(
      attempt.id
    );
  }

  return {
    skill: {
      id: candidateSkill.skill_id,
      name: candidateSkill.skill_name,
      claimedLevel: candidateSkill.claimed_level,
      verifiedScore: candidateSkill.verified_score,
      verifiedLevel: candidateSkill.verified_level,
      verificationStatus:
        candidateSkill.verification_status,
    },
    attempt,
    questions,
  };
};

module.exports = {
  createVerificationAttempt,
  startAssessment,
  submitAssessment,
  getVerificationStatus,
};