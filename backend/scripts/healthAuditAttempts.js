require("dotenv").config();
const pool = require("../src/config/db");

(async () => {
  const rows = await pool.query(`
    SELECT
      sva.id AS attempt_id,
      sva.status,
      sm.skill_name,
      sai.id AS instance_id,
      sai.generation_seed,
      sai.created_at,
      LEFT(sai.generated_assessment::text, 180) AS assessment_preview
    FROM skill_verification_attempts sva
    JOIN candidate_skills cs ON cs.id = sva.candidate_skill_id
    JOIN skills_master sm ON sm.id = cs.skill_id
    LEFT JOIN skill_assessment_instances sai ON sai.verification_attempt_id = sva.id
    WHERE cs.candidate_id = 3
    ORDER BY sva.id DESC
    LIMIT 15
  `);
  console.log(JSON.stringify(rows.rows, null, 2));
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
