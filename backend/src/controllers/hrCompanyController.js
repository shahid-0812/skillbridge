const pool = require("../config/db");

const getCompany = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;

        const result = await pool.query(
            `SELECT
                id,
                company_name,
                company_logo_url,
                industry,
                company_size,
                website_url,
                description,
                country,
                state,
                city,
                address,
                contact_email,
                contact_phone,
                created_at,
                updated_at
             FROM companies
             WHERE id = $1`,
            [companyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                company: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};
const updateCompany = async (req, res, next) => {
    try {
        const companyId = req.companyMember.company_id;

        const {
            companyName,
            companyLogoUrl,
            industry,
            companySize,
            websiteUrl,
            description,
            country,
            state,
            city,
            address,
            contactEmail,
            contactPhone,
        } = req.body;

        if (!companyName || !companyName.trim()) {
            return res.status(400).json({
                success: false,
                message: "Company name is required",
            });
        }

        const result = await pool.query(
            `UPDATE companies
             SET
                company_name = $1,
                company_logo_url = $2,
                industry = $3,
                company_size = $4,
                website_url = $5,
                description = $6,
                country = $7,
                state = $8,
                city = $9,
                address = $10,
                contact_email = $11,
                contact_phone = $12,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $13
             RETURNING
                id,
                company_name,
                company_logo_url,
                industry,
                company_size,
                website_url,
                description,
                country,
                state,
                city,
                address,
                contact_email,
                contact_phone,
                created_at,
                updated_at`,
            [
                companyName.trim(),
                companyLogoUrl || null,
                industry || null,
                companySize || null,
                websiteUrl || null,
                description || null,
                country || null,
                state || null,
                city || null,
                address || null,
                contactEmail || null,
                contactPhone || null,
                companyId,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Company profile updated successfully",
            data: {
                company: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCompany,
    updateCompany,
};