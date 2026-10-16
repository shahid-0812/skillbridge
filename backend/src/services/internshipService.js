const pool = require("../config/db");

const internshipFields = `
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
  internship_url,
  created_at,
  updated_at
`;

const getInternships = async (candidateId) => {
  const result = await pool.query(
    `SELECT ${internshipFields}
     FROM internships
     WHERE candidate_id = $1
     ORDER BY start_date DESC, id DESC`,
    [candidateId]
  );

  return result.rows;
};

const addInternship = async ({
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
  internshipUrl,
}) => {
  const result = await pool.query(
    `INSERT INTO internships (
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
      internship_url
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING ${internshipFields}`,
    [
      candidateId,
      companyName,
      role,
      description,
      startDate,
      isCurrent ?? false ? null : endDate || null,
      isCurrent ?? false,
      location || null,
      workSetting || null,
      technologiesUsed || null,
      certificateUrl || null,
      internshipUrl || null,
    ]
  );

  return result.rows[0];
};

const updateInternship = async ({
  candidateId,
  internshipId,
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
  internshipUrl,
}) => {
  const result = await pool.query(
    `UPDATE internships
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
       internship_url = $11,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $12
       AND candidate_id = $13
     RETURNING ${internshipFields}`,
    [
      companyName,
      role,
      description,
      startDate,
      isCurrent ?? false ? null : endDate || null,
      isCurrent ?? false,
      location || null,
      workSetting || null,
      technologiesUsed || null,
      certificateUrl || null,
      internshipUrl || null,
      internshipId,
      candidateId,
    ]
  );

  if (result.rows.length === 0) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

const deleteInternship = async ({
  candidateId,
  internshipId,
}) => {
  const result = await pool.query(
    `DELETE FROM internships
     WHERE id = $1
       AND candidate_id = $2
     RETURNING
       id,
       candidate_id,
       company_name,
       role`,
    [internshipId, candidateId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getInternships,
  addInternship,
  updateInternship,
  deleteInternship,
};