const pool = require("../config/db");

const getEducationByCandidateId = async (candidateId) => {
  const result = await pool.query(
    `SELECT
       id,
       candidate_id,
       education_level,
       degree_name,
       institution_name,
       start_date,
       end_date,
       score,
       score_type,
       created_at,
       updated_at
     FROM candidate_education
     WHERE candidate_id = $1
     ORDER BY start_date DESC, id DESC`,
    [candidateId]
  );

  return result.rows;
};


const createEducation = async (candidateId, data) => {
  const {
    education_level,
    degree_name,
    institution_name,
    start_date,
    end_date,
    score,
    score_type,
  } = data;

  const result = await pool.query(
    `INSERT INTO candidate_education (
       candidate_id,
       education_level,
       degree_name,
       institution_name,
       start_date,
       end_date,
       score,
       score_type
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING
       id,
       candidate_id,
       education_level,
       degree_name,
       institution_name,
       start_date,
       end_date,
       score,
       score_type,
       created_at,
       updated_at`,
    [
      candidateId,
      education_level,
      degree_name,
      institution_name,
      start_date,
      end_date || null,
      score ?? null,
      score_type || null,
    ]
  );

  return result.rows[0];
};


const updateEducation = async (candidateId, educationId, data) => {
  const {
    education_level,
    degree_name,
    institution_name,
    start_date,
    end_date,
    score,
    score_type,
  } = data;

  const result = await pool.query(
    `UPDATE candidate_education
     SET
       education_level = $1,
       degree_name = $2,
       institution_name = $3,
       start_date = $4,
       end_date = $5,
       score = $6,
       score_type = $7,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
       AND candidate_id = $9
     RETURNING
       id,
       candidate_id,
       education_level,
       degree_name,
       institution_name,
       start_date,
       end_date,
       score,
       score_type,
       created_at,
       updated_at`,
    [
      education_level,
      degree_name,
      institution_name,
      start_date,
      end_date || null,
      score ?? null,
      score_type || null,
      educationId,
      candidateId,
    ]
  );

  if (result.rows.length === 0) {
    const error = new Error("Education record not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};


const deleteEducation = async (candidateId, educationId) => {
  const result = await pool.query(
    `DELETE FROM candidate_education
     WHERE id = $1
       AND candidate_id = $2
     RETURNING id`,
    [educationId, candidateId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Education record not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};


module.exports = {
  getEducationByCandidateId,
  createEducation,
  updateEducation,
  deleteEducation,
};