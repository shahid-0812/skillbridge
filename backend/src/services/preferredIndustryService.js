const pool = require("../config/db");

const getAvailablePreferredIndustries = async () => {
  const result = await pool.query(
    `SELECT
       id,
       industry_name,
       created_at
     FROM preferred_industries
     ORDER BY industry_name`
  );

  return result.rows;
};

const getCandidatePreferredIndustries = async (candidateId) => {
  const result = await pool.query(
    `SELECT
       cpi.candidate_id,
       cpi.industry_id,
       pi.industry_name
     FROM candidate_preferred_industries cpi
     INNER JOIN preferred_industries pi
       ON cpi.industry_id = pi.id
     WHERE cpi.candidate_id = $1
     ORDER BY pi.industry_name`,
    [candidateId]
  );

  return result.rows;
};

const addCandidatePreferredIndustry = async ({
  candidateId,
  industryId,
}) => {
  const industryResult = await pool.query(
    `SELECT
       id,
       industry_name
     FROM preferred_industries
     WHERE id = $1`,
    [industryId]
  );

  if (industryResult.rows.length === 0) {
    const error = new Error("Preferred industry not found");
    error.statusCode = 404;
    throw error;
  }

  const existingIndustry = await pool.query(
    `SELECT
       candidate_id,
       industry_id
     FROM candidate_preferred_industries
     WHERE candidate_id = $1
       AND industry_id = $2`,
    [candidateId, industryId]
  );

  if (existingIndustry.rows.length > 0) {
    const error = new Error(
      "Candidate already has this preferred industry"
    );
    error.statusCode = 409;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO candidate_preferred_industries (
       candidate_id,
       industry_id
     )
     VALUES ($1, $2)
     RETURNING
       candidate_id,
       industry_id`,
    [candidateId, industryId]
  );

  return {
    ...result.rows[0],
    industry_name: industryResult.rows[0].industry_name,
  };
};

const deleteCandidatePreferredIndustry = async ({
  candidateId,
  industryId,
}) => {
  const result = await pool.query(
    `DELETE FROM candidate_preferred_industries
     WHERE candidate_id = $1
       AND industry_id = $2
     RETURNING
       candidate_id,
       industry_id`,
    [candidateId, industryId]
  );

  if (result.rows.length === 0) {
    const error = new Error(
      "Candidate preferred industry not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getAvailablePreferredIndustries,
  getCandidatePreferredIndustries,
  addCandidatePreferredIndustry,
  deleteCandidatePreferredIndustry,
};