const pool = require("../config/db");

const getUserIdentity = async (userId) => {
  const candidateResult = await pool.query(
    `SELECT
       id,
       user_id
     FROM candidates
     WHERE user_id = $1
     LIMIT 1`,
    [userId]
  );

  if (candidateResult.rows.length > 0) {
    const candidate = candidateResult.rows[0];

    return {
      userType: "candidate",
      candidateId: candidate.id,
    };
  }

  return {
    userType: "user",
  };
};

module.exports = {
  getUserIdentity,
};