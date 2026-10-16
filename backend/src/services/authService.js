const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { generateToken } = require("../utils/jwt");

const registerUser = async ({ firstName, lastName, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check whether email already exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE LOWER(email) = $1",
    [normalizedEmail],
  );

  if (existingUser.rows.length > 0) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  // Hash password before storing it
  const passwordHash = await bcrypt.hash(password, 12);

  const client = await pool.connect();

  let user;

  try {
    await client.query("BEGIN");

    // Create user account
    const userResult = await client.query(
      `INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, first_name, last_name, email, created_at`,
      [firstName.trim(), lastName.trim(), normalizedEmail, passwordHash],
    );

    user = userResult.rows[0];

    // Create candidate profile
    await client.query(
      `INSERT INTO candidates (user_id)
       VALUES ($1)`,
      [user.id],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  // Generate JWT
  const token = generateToken({
    sub: String(user.id),
    email: user.email,
  });

  return {
    user,
    token,
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT
      id,
      first_name,
      last_name,
      email,
      password_hash,
      created_at
     FROM users
     WHERE LOWER(email) = $1`,
    [normalizedEmail],
  );

  if (result.rows.length === 0) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT
  const token = generateToken({
    sub: String(user.id),
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      created_at: user.created_at,
    },
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};
