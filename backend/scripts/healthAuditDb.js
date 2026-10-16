require("dotenv").config();
const pool = require("../src/config/db");
const bcrypt = require("bcryptjs");

(async () => {
  const db = await pool.query("SELECT current_database() AS db, current_user AS usr");
  const tables = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1`
  );
  const fks = await pool.query(`
    SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    ORDER BY 1, 2
  `);
  const users = await pool.query(
    `SELECT id, email, LEFT(password_hash, 20) AS hash_prefix, LENGTH(password_hash) AS hash_len, auth_provider
     FROM users ORDER BY id`
  );
  const candidates = await pool.query(
    `SELECT id, user_id, profile_type FROM candidates ORDER BY id`
  );
  const team = await pool.query(
    `SELECT id, company_id, user_id, role, status FROM company_team_members`
  );
  const skills = await pool.query(
    `SELECT COUNT(*)::int AS n FROM skills_master`
  );
  const comps = await pool.query(`
    SELECT sm.skill_name, COUNT(*)::int AS n
    FROM skill_competencies sc
    JOIN skills_master sm ON sm.id = sc.skill_id
    GROUP BY sm.skill_name
    ORDER BY sm.skill_name
  `);
  const charlie = await pool.query(
    `SELECT id, email, password_hash FROM users WHERE LOWER(email)='charlie.devops@email.com'`
  );
  let bcryptMatch = null;
  if (charlie.rows[0]) {
    bcryptMatch = await bcrypt.compare("DevOps@12345", charlie.rows[0].password_hash || "");
  }
  const candidateSkills = await pool.query(`
    SELECT cs.candidate_id, sm.skill_name, cs.proficiency_level, cs.verification_status
    FROM candidate_skills cs
    JOIN skills_master sm ON sm.id = cs.skill_id
    ORDER BY cs.candidate_id, sm.skill_name
  `);
  const attempts = await pool.query(
    `SELECT COUNT(*)::int AS n FROM skill_verification_attempts`
  );
  const instances = await pool.query(
    `SELECT COUNT(*)::int AS n FROM skill_assessment_instances`
  );
  const jobs = await pool.query(`SELECT COUNT(*)::int AS n FROM jobs`);
  const apps = await pool.query(`SELECT COUNT(*)::int AS n FROM applications`);
  const missingComps = await pool.query(`
    SELECT sm.id, sm.skill_name
    FROM skills_master sm
    LEFT JOIN skill_competencies sc ON sc.skill_id = sm.id
    WHERE sc.id IS NULL
    ORDER BY sm.id
  `);

  console.log(JSON.stringify({
    db: db.rows[0],
    table_count: tables.rows.length,
    tables: tables.rows.map((r) => r.tablename),
    fk_count: fks.rows.length,
    users: users.rows,
    candidate_count: candidates.rows.length,
    team,
    skills: skills.rows[0],
    competency_by_skill: comps.rows,
    skills_without_competencies: missingComps.rows,
    charlie_bcrypt_matches_demo_password: bcryptMatch,
    candidate_skills: candidateSkills.rows,
    skill_verification_attempts: attempts.rows[0].n,
    skill_assessment_instances: instances.rows[0].n,
    jobs: jobs.rows[0].n,
    applications: apps.rows[0].n,
  }, null, 2));
  await pool.end();
})().catch((e) => {
  console.error("DB_AUDIT_FAIL", e.message);
  process.exit(1);
});
