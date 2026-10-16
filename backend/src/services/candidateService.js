const pool = require("../config/db");

const candidateFields = `
  candidates.id,
  candidates.user_id,
  users.first_name,
  users.last_name,
  users.email,
  candidates.profile_photo_url,
  candidates.professional_headline,
  candidates.phone_number,
  candidates.country,
  candidates.state,
  candidates.city,
  candidates.professional_summary,
  candidates.resume_url,
  candidates.linkedin_url,
  candidates.github_url,
  candidates.personal_website_url,
  candidates.created_at,
  candidates.updated_at
`;

const getCandidateById = async (candidateId) => {
  const result = await pool.query(
    `SELECT ${candidateFields}
     FROM candidates
     INNER JOIN users
       ON users.id = candidates.user_id
     WHERE candidates.id = $1
     LIMIT 1`,
    [candidateId]
  );

  return result.rows[0] || null;
};

const updateCandidateById = async (candidateId, data) => {
  const allowedFields = [
    "profile_photo_url",
    "professional_headline",
    "phone_number",
    "country",
    "state",
    "city",
    "professional_summary",
    "resume_url",
    "linkedin_url",
    "github_url",
    "personal_website_url",
  ];

  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      updates.push(`${field} = $${values.length + 1}`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) {
    const error = new Error("No valid candidate fields provided");
    error.statusCode = 400;
    throw error;
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");

  values.push(candidateId);

  const result = await pool.query(
    `UPDATE candidates
     SET ${updates.join(", ")}
     WHERE id = $${values.length}
     RETURNING id`,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  // Fetch the complete candidate profile, including
  // first name, last name, and email from users.
  return await getCandidateById(candidateId);
};

module.exports = {
  getCandidateById,
  updateCandidateById,
};