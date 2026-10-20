
const aiJobDescriptionClient = require("../services/aiJobDescriptionClient");

async function generateJobDescription(req, res, next) {
  try {
    const {
      job_title,
      experience_level,
      required_skills,
      responsibilities,
      employment_type,
      location,
      company_name,
      additional_details,
    } = req.body;

    // Validate required information before calling the AI.
    if (
      typeof job_title !== "string" ||
      !job_title.trim() ||
      typeof experience_level !== "string" ||
      !experience_level.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Job title and experience level are required.",
      });
    }

    if (
      !Array.isArray(required_skills) ||
      required_skills.length === 0 ||
      !required_skills.every(
        (skill) => typeof skill === "string" && skill.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid required skill.",
      });
    }

    if (
      !Array.isArray(responsibilities) ||
      responsibilities.length === 0 ||
      !responsibilities.every(
        (item) => typeof item === "string" && item.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid responsibility.",
      });
    }

    const result =
      await aiJobDescriptionClient.generateJobDescription({
        job_title: job_title.trim(),
        experience_level: experience_level.trim(),
        required_skills: required_skills.map((skill) => skill.trim()),
        responsibilities: responsibilities.map((item) => item.trim()),
        employment_type,
        location,
        company_name,
        additional_details,
      });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateJobDescription,
};
