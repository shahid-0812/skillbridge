const pool = require("../config/db");

const projectFields = `
  id,
  candidate_id,
  project_name,
  description,
  role,
  technologies_used,
  start_date,
  end_date,
  project_url,
  team_size,
  is_academic_project,
  created_at,
  updated_at
`;

const getProjects = async (candidateId) => {
  const result = await pool.query(
    `SELECT ${projectFields}
     FROM projects
     WHERE candidate_id = $1
     ORDER BY id DESC`,
    [candidateId]
  );

  return result.rows;
};

const addProject = async ({
  candidateId,
  projectName,
  description,
  role,
  technologiesUsed,
  startDate,
  endDate,
  projectUrl,
  teamSize,
  isAcademicProject,
}) => {
  const result = await pool.query(
    `INSERT INTO projects (
      candidate_id,
      project_name,
      description,
      role,
      technologies_used,
      start_date,
      end_date,
      project_url,
      team_size,
      is_academic_project
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING ${projectFields}`,
    [
      candidateId,
      projectName,
      description,
      role,
      technologiesUsed || null,
      startDate || null,
      endDate || null,
      projectUrl || null,
      teamSize ?? null,
      isAcademicProject ?? false,
    ]
  );

  return result.rows[0];
};

const updateProject = async ({
  candidateId,
  projectId,
  projectName,
  description,
  role,
  technologiesUsed,
  startDate,
  endDate,
  projectUrl,
  teamSize,
  isAcademicProject,
}) => {
  const result = await pool.query(
    `UPDATE projects
     SET
       project_name = $1,
       description = $2,
       role = $3,
       technologies_used = $4,
       start_date = $5,
       end_date = $6,
       project_url = $7,
       team_size = $8,
       is_academic_project = $9,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $10
       AND candidate_id = $11
     RETURNING ${projectFields}`,
    [
      projectName,
      description,
      role,
      technologiesUsed || null,
      startDate || null,
      endDate || null,
      projectUrl || null,
      teamSize ?? null,
      isAcademicProject ?? false,
      projectId,
      candidateId,
    ]
  );

  if (result.rows.length === 0) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

const deleteProject = async ({
  candidateId,
  projectId,
}) => {
  const result = await pool.query(
    `DELETE FROM projects
     WHERE id = $1
       AND candidate_id = $2
     RETURNING
       id,
       candidate_id,
       project_name`,
    [projectId, candidateId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
};