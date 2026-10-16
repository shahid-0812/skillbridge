const skillService = require("../services/skillService");

const getSkills = async (req, res, next) => {
    try {
        const search = req.query.q || "";

        const skills = await skillService.getSkills(search);

        return res.status(200).json({
            success: true,
            data: {
                skills,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSkills,
};