require("dotenv").config();
const pool = require("../src/config/db");

(async () => {
  const dupSkills = await pool.query(`
    SELECT candidate_id, skill_id, COUNT(*)::int AS n
    FROM candidate_skills
    GROUP BY candidate_id, skill_id
    HAVING COUNT(*) > 1
  `);
  const dupApps = await pool.query(`
    SELECT candidate_id, job_id, COUNT(*)::int AS n
    FROM applications
    GROUP BY candidate_id, job_id
    HAVING COUNT(*) > 1
  `);
  const teamStatuses = await pool.query(`
    SELECT status, COUNT(*)::int AS n
    FROM company_team_members
    GROUP BY status
    ORDER BY n DESC
  `);
  const skillCompCount = await pool.query(
    `SELECT COUNT(*)::int AS n FROM skill_competencies`
  );
  const jobSkillCols = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'job_required_skills'
    ORDER BY ordinal_position
  `);
  const userCols = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `);

  console.log("duplicate_candidate_skills", dupSkills.rows);
  console.log("duplicate_applications", dupApps.rows);
  console.log("company_team_member_statuses", teamStatuses.rows);
  console.log("skill_competencies_count", skillCompCount.rows[0].n);
  console.log("job_required_skills_columns", jobSkillCols.rows.map((r) => r.column_name));
  console.log("users_columns", userCols.rows.map((r) => r.column_name));
  await pool.end();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
