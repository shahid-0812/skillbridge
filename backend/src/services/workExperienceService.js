const pool = require("../config/db");

const workExperienceFields = `
  id,
  candidate_id,
  company_name,
  role,
  description,
  start_date,
  end_date,
  is_current,
  location,
  work_setting,
  technologies_used,
  certificate_url,
  experience_url,
  created_at,
  updated_at
`;

const getWorkExperiences = async (candidateId) => {
  const result = await pool.query(
    `SELECT ${workExperienceFields}
     FROM work_experience
     WHERE candidate_id = $1
     ORDER BY start_date DESC, id DESC`,
    [candidateId]
  );

  return result.rows;
};

const addWorkExperience = async ({
  candidateId,
  companyName,
  role,
  description,
  startDate,
  endDate,
  isCurrent,
  location,
  workSetting,
  technologiesUsed,
  certificateUrl,
  experienceUrl,
}) => {
  const current = isCurrent === true;

  const result = await pool.query(
    `INSERT INTO work_experience (
      candidate_id,
      company_name,
      role,
      description,
      start_date,
      end_date,
      is_current,
      location,
      work_setting,
      technologies_used,
      certificate_url,
      experience_url
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING ${workExperienceFields}`,
    [
      candidateId,
      companyName,
      role,
      description,
      startDate,
      current ? null : endDate || null,
      current,
      location || null,
      workSetting || null,
      technologiesUsed || null,
      certificateUrl || null,
      experienceUrl || null,
    ]
  );

  return result.rows[0];
};

const updateWorkExperience = async ({
  candidateId,
  experienceId,
  companyName,
  role,
  description,
  startDate,
  endDate,
  isCurrent,
  location,
  workSetting,
  technologiesUsed,
  certificateUrl,
  experienceUrl,
}) => {
  const current = isCurrent === true;

  const result = await pool.query(
    `UPDATE work_experience
     SET
       company_name = $1,
       role = $2,
       description = $3,
       start_date = $4,
       end_date = $5,
       is_current = $6,
       location = $7,
       work_setting = $8,
       technologies_used = $9,
       certificate_url = $10,
       experience_url = $11,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $12
       AND candidate_id = $13
     RETURNING ${workExperienceFields}`,
    [
      companyName,
      role,
      description,
      startDate,
      current ? null : endDate || null,
      current,
      location || null,
      workSetting || null,
      technologiesUsed || null,
      certificateUrl || null,
      experienceUrl || null,
      experienceId,
      candidateId,
    ]
  );

  if (result.rows.length === 0) {
    const error = new Error("Work experience not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

const deleteWorkExperience = async ({
  candidateId,
  experienceId,
}) => {
  const result = await pool.query(
    `DELETE FROM work_experience
     WHERE id = $1
       AND candidate_id = $2
     RETURNING
       id,
       candidate_id,
       company_name,
       role`,
    [experienceId, candidateId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Work experience not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getWorkExperiences,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
};