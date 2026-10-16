const { registerHR } = require("../services/hrAuthService");

const register = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            companyName,
        } = req.body;

        // Required fields
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !companyName
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, email, password, confirm password and company name are required",
            });
        }

        // Field types
        if (
            typeof firstName !== "string" ||
            typeof lastName !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof confirmPassword !== "string" ||
            typeof companyName !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields must be strings",
            });
        }

        // Names and company
        if (
            firstName.trim().length === 0 ||
            lastName.trim().length === 0 ||
            companyName.trim().length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name and company name cannot be empty",
            });
        }

        // Password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        // Password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const result = await registerHR({
            firstName,
            lastName,
            email,
            password,
            companyName,
        });

        return res.status(201).json({
            success: true,
            message: "HR account registered successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
};