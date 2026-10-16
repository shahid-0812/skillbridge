const pool = require("../config/db");

const getSkills = async (search = "") => {
    const result = await pool.query(
        `SELECT
            id,
            skill_name,
            created_at
         FROM skills_master
         WHERE skill_name ILIKE $1
         ORDER BY skill_name
         LIMIT 100`,
        [`%${search.trim()}%`]
    );

    return result.rows;
};

module.exports = {
    getSkills,
};