const pool = require("../config/db");

const getAvailablePreferredWorkSettings = async () => {
  const result = await pool.query(
    `SELECT
       id,
       setting_name,
       created_at
     FROM preferred_work_settings
     ORDER BY setting_name`
  );

  return result.rows;
};

const getCandidatePreferredWorkSettings = async (candidateId) => {
  const result = await pool.query(
    `SELECT
       cpws.candidate_id,
       cpws.setting_id,
       pws.setting_name
     FROM candidate_preferred_work_settings cpws
     INNER JOIN preferred_work_settings pws
       ON cpws.setting_id = pws.id
     WHERE cpws.candidate_id = $1
     ORDER BY pws.setting_name`,
    [candidateId]
  );

  return result.rows;
};

const addCandidatePreferredWorkSetting = async ({
  candidateId,
  settingId,
}) => {
  const settingResult = await pool.query(
    `SELECT
       id,
       setting_name
     FROM preferred_work_settings
     WHERE id = $1`,
    [settingId]
  );

  if (settingResult.rows.length === 0) {
    const error = new Error("Preferred work setting not found");
    error.statusCode = 404;
    throw error;
  }

  const existingSetting = await pool.query(
    `SELECT
       candidate_id,
       setting_id
     FROM candidate_preferred_work_settings
     WHERE candidate_id = $1
       AND setting_id = $2`,
    [candidateId, settingId]
  );

  if (existingSetting.rows.length > 0) {
    const error = new Error(
      "Candidate already has this preferred work setting"
    );
    error.statusCode = 409;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO candidate_preferred_work_settings (
       candidate_id,
       setting_id
     )
     VALUES ($1, $2)
     RETURNING
       candidate_id,
       setting_id`,
    [candidateId, settingId]
  );

  return {
    ...result.rows[0],
    setting_name: settingResult.rows[0].setting_name,
  };
};

const deleteCandidatePreferredWorkSetting = async ({
  candidateId,
  settingId,
}) => {
  const result = await pool.query(
    `DELETE FROM candidate_preferred_work_settings
     WHERE candidate_id = $1
       AND setting_id = $2
     RETURNING
       candidate_id,
       setting_id`,
    [candidateId, settingId]
  );

  if (result.rows.length === 0) {
    const error = new Error(
      "Candidate preferred work setting not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getAvailablePreferredWorkSettings,
  getCandidatePreferredWorkSettings,
  addCandidatePreferredWorkSetting,
  deleteCandidatePreferredWorkSetting,
};