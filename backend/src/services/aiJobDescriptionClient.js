
const axios = require("axios");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

class AiJobDescriptionClient {
  async generateJobDescription(jobDetails) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/ai/job-description`,
        {
          job_title: jobDetails.job_title,
          experience_level: jobDetails.experience_level,
          required_skills: jobDetails.required_skills,
          responsibilities: jobDetails.responsibilities,
          employment_type: jobDetails.employment_type || null,
          location: jobDetails.location || null,
          company_name: jobDetails.company_name || null,
          additional_details: jobDetails.additional_details || null,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 120000,
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "AI job description service error:",
        error.response?.data || error.message
      );

      throw new Error(
        `AI job description request failed: ${
          error.response?.status || error.message
        }`
      );
    }
  }
}

module.exports = new AiJobDescriptionClient();
