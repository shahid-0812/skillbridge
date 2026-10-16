const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { generateToken } = require("../utils/jwt");

const registerHR = async ({
    firstName,
    lastName,
    email,
    password,
    companyName,
}) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await pool.query(
        "SELECT id FROM users WHERE LOWER(email) = $1",
        [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Create user
        const userResult = await client.query(
            `INSERT INTO users (
                first_name,
                last_name,
                email,
                password_hash
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id, first_name, last_name, email, created_at`,
            [
                firstName.trim(),
                lastName.trim(),
                normalizedEmail,
                passwordHash,
            ]
        );

        const user = userResult.rows[0];

        // 2. Create company
        const companyResult = await client.query(
            `INSERT INTO companies (
                company_name
            )
            VALUES ($1)
            RETURNING id, company_name, created_at`,
            [companyName.trim()]
        );

        const company = companyResult.rows[0];

        // 3. Connect user to company
        const memberResult = await client.query(
            `INSERT INTO company_members (
                user_id,
                company_id,
                role
            )
            VALUES ($1, $2, $3)
            RETURNING id, user_id, company_id, role`,
            [
                user.id,
                company.id,
                "HR",
            ]
        );

        await client.query("COMMIT");

        // 4. Generate JWT
        const token = generateToken({
            sub: String(user.id),
            email: user.email,
        });

        return {
            user,
            company,
            companyMember: memberResult.rows[0],
            token,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    registerHR,
};