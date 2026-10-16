const pool = require("../config/db");

const getAvailableTargetRoles = async () => {
  const result = await pool.query(
    `SELECT
       id,
       role_name,
       created_at
     FROM target_roles
     ORDER BY role_name`
  );

  return result.rows;
};

const getCandidateTargetRoles = async (candidateId) => {
  const result = await pool.query(
    `SELECT
       ctr.candidate_id,
       ctr.role_id,
       tr.role_name
     FROM candidate_target_roles ctr
     INNER JOIN target_roles tr
       ON ctr.role_id = tr.id
     WHERE ctr.candidate_id = $1
     ORDER BY tr.role_name`,
    [candidateId]
  );

  return result.rows;
};

const addCandidateTargetRole = async ({
  candidateId,
  roleId,
}) => {
  const roleResult = await pool.query(
    `SELECT
       id,
       role_name
     FROM target_roles
     WHERE id = $1`,
    [roleId]
  );

  if (roleResult.rows.length === 0) {
    const error = new Error("Target role not found");
    error.statusCode = 404;
    throw error;
  }

  const existingRole = await pool.query(
    `SELECT
       candidate_id,
       role_id
     FROM candidate_target_roles
     WHERE candidate_id = $1
       AND role_id = $2`,
    [candidateId, roleId]
  );

  if (existingRole.rows.length > 0) {
    const error = new Error(
      "Candidate already has this target role"
    );
    error.statusCode = 409;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO candidate_target_roles (
       candidate_id,
       role_id
     )
     VALUES ($1, $2)
     RETURNING
       candidate_id,
       role_id`,
    [candidateId, roleId]
  );

  return {
    ...result.rows[0],
    role_name: roleResult.rows[0].role_name,
  };
};

const deleteCandidateTargetRole = async ({
  candidateId,
  roleId,
}) => {
  const result = await pool.query(
    `DELETE FROM candidate_target_roles
     WHERE candidate_id = $1
       AND role_id = $2
     RETURNING
       candidate_id,
       role_id`,
    [candidateId, roleId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Candidate target role not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getAvailableTargetRoles,
  getCandidateTargetRoles,
  addCandidateTargetRole,
  deleteCandidateTargetRole,
};