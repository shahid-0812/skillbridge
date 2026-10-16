require("dotenv").config();
const pool = require("../src/config/db");

(async () => {
  const tables = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1`
  );
  console.log("TABLES:");
  for (const row of tables.rows) {
    console.log(row.tablename);
  }

  const cols = await pool.query(
    `SELECT table_name, column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name IN (
         'users','job_required_skills','applications','assessment_attempts',
         'candidates','company_team_members'
       )
     ORDER BY table_name, ordinal_position`
  );
  console.log("\nCOLUMNS:");
  for (const row of cols.rows) {
    console.log(`${row.table_name}.${row.column_name} ${row.data_type}`);
  }
  await pool.end();
})().catch(async (err) => {
  console.error(err.message);
  process.exit(1);
});
