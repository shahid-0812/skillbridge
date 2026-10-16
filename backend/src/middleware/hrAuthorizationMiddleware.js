const pool = require("../config/db");

const authorizeHR = async (req, res, next) => {
    try {
        const userId = req.user.sub;

        const result = await pool.query(
            `SELECT
                cm.id,
                cm.user_id,
                cm.company_id,
                cm.role,
                c.company_name
             FROM company_members cm
             JOIN companies c
                ON c.id = cm.company_id
             WHERE cm.user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "HR access required",
            });
        }

        req.companyMember = result.rows[0];

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    authorizeHR,
};