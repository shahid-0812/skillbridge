require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");

(async () => {
  const file = path.resolve(
    __dirname,
    "../../database/migrations/002_platform_completion.sql"
  );
  const sql = fs.readFileSync(file, "utf8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Applied", path.basename(file), "in a transaction");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  await pool.end();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
