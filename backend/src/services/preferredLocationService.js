const pool = require("../config/db");

const getAvailablePreferredLocations = async () => {
  const result = await pool.query(
    `SELECT
       id,
       location_name,
       created_at
     FROM preferred_locations
     ORDER BY location_name`
  );

  return result.rows;
};

const getCandidatePreferredLocations = async (candidateId) => {
  const result = await pool.query(
    `SELECT
       cpl.candidate_id,
       cpl.location_id,
       pl.location_name
     FROM candidate_preferred_locations cpl
     INNER JOIN preferred_locations pl
       ON cpl.location_id = pl.id
     WHERE cpl.candidate_id = $1
     ORDER BY pl.location_name`,
    [candidateId]
  );

  return result.rows;
};

const addCandidatePreferredLocation = async ({
  candidateId,
  locationId,
}) => {
  const locationResult = await pool.query(
    `SELECT
       id,
       location_name
     FROM preferred_locations
     WHERE id = $1`,
    [locationId]
  );

  if (locationResult.rows.length === 0) {
    const error = new Error("Preferred location not found");
    error.statusCode = 404;
    throw error;
  }

  const existingLocation = await pool.query(
    `SELECT
       candidate_id,
       location_id
     FROM candidate_preferred_locations
     WHERE candidate_id = $1
       AND location_id = $2`,
    [candidateId, locationId]
  );

  if (existingLocation.rows.length > 0) {
    const error = new Error(
      "Candidate already has this preferred location"
    );
    error.statusCode = 409;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO candidate_preferred_locations (
       candidate_id,
       location_id
     )
     VALUES ($1, $2)
     RETURNING
       candidate_id,
       location_id`,
    [candidateId, locationId]
  );

  return {
    ...result.rows[0],
    location_name: locationResult.rows[0].location_name,
  };
};

const deleteCandidatePreferredLocation = async ({
  candidateId,
  locationId,
}) => {
  const result = await pool.query(
    `DELETE FROM candidate_preferred_locations
     WHERE candidate_id = $1
       AND location_id = $2
     RETURNING
       candidate_id,
       location_id`,
    [candidateId, locationId]
  );

  if (result.rows.length === 0) {
    const error = new Error(
      "Candidate preferred location not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getAvailablePreferredLocations,
  getCandidatePreferredLocations,
  addCandidatePreferredLocation,
  deleteCandidatePreferredLocation,
};