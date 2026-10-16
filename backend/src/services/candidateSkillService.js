const pool = require("../config/db");

const getCandidateSkills = async (candidateId) => {
  const result = await pool.query(
    `SELECT
       cs.id,
       cs.candidate_id,
       cs.skill_id,
       sm.skill_name,
       cs.claimed_level,
       cs.verified_score,
       cs.verified_level,
       cs.verification_status,
       cs.is_growth_area,
       cs.created_at,
       cs.updated_at
     FROM candidate_skills cs
     INNER JOIN skills_master sm
       ON cs.skill_id = sm.id
     WHERE cs.candidate_id = $1
     ORDER BY sm.skill_name`,
    [candidateId]
  );

  return result.rows;
};

const addCandidateSkill = async ({
  candidateId,
  skillId,
  claimedLevel,
}) => {
  const skillResult = await pool.query(
    `SELECT id, skill_name
     FROM skills_master
     WHERE id = $1`,
    [skillId]
  );

  if (skillResult.rows.length === 0) {
    const error = new Error("Skill not found");
    error.statusCode = 404;
    throw error;
  }

  const existingSkill = await pool.query(
    `SELECT id
     FROM candidate_skills
     WHERE candidate_id = $1
       AND skill_id = $2`,
    [candidateId, skillId]
  );

  if (existingSkill.rows.length > 0) {
    const error = new Error("Candidate already has this skill");
    error.statusCode = 409;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO candidate_skills (
       candidate_id,
       skill_id,
       claimed_level
     )
     VALUES ($1, $2, $3)
     RETURNING
       id,
       candidate_id,
       skill_id,
       claimed_level,
       verified_score,
       verified_level,
       verification_status,
       is_growth_area,
       created_at,
       updated_at`,
    [
      candidateId,
      skillId,
      claimedLevel,
    ]
  );

  return {
    ...result.rows[0],
    skill_name: skillResult.rows[0].skill_name,
  };
};

const updateCandidateSkill = async ({
  candidateId,
  skillId,
  claimedLevel,
}) => {
  const result = await pool.query(
    `UPDATE candidate_skills
     SET
       claimed_level = $1,
       updated_at = CURRENT_TIMESTAMP
     WHERE candidate_id = $2
       AND skill_id = $3
     RETURNING
       id,
       candidate_id,
       skill_id,
       claimed_level,
       verified_score,
       verified_level,
       verification_status,
       is_growth_area,
       created_at,
       updated_at`,
    [
      claimedLevel,
      candidateId,
      skillId,
    ]
  );

  if (result.rows.length === 0) {
    const error = new Error("Candidate skill not found");
    error.statusCode = 404;
    throw error;
  }

  const skillResult = await pool.query(
    `SELECT skill_name
     FROM skills_master
     WHERE id = $1`,
    [skillId]
  );

  return {
    ...result.rows[0],
    skill_name: skillResult.rows[0]?.skill_name || null,
  };
};

const deleteCandidateSkill = async ({
  candidateId,
  skillId,
}) => {
  const result = await pool.query(
    `DELETE FROM candidate_skills
     WHERE candidate_id = $1
       AND skill_id = $2
     RETURNING
       id,
       candidate_id,
       skill_id`,
    [candidateId, skillId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Candidate skill not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getCandidateSkills,
  addCandidateSkill,
  updateCandidateSkill,
  deleteCandidateSkill,
};