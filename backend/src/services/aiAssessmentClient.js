const axios = require("axios");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

class AiAssessmentClient {
  async generateAssessment({ skill, difficulty, generationSeed, competencies = [] }) {
    try {
      const payload = {
        skill: skill,
        difficulty: difficulty || "Basic",
        generation_seed: generationSeed || `${Date.now()}`,
        competencies: competencies.length ? competencies : [
          { name: "Core Concepts" },
          { name: "Practical Application" },
          { name: "Problem Solving" }
        ],
        candidate_context: {
          experience_years: null,
          target_role: null,
          profile_type: null
        },
        assessment_preferences: {
          practical: true,
          unique: true,
          real_world: true
        },
        previous_assessment_fingerprints: []
      };

      const response = await axios.post(
        `${AI_SERVICE_URL}/api/v1/assessments/generate`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 120000,
        }
      );

      return response.data;
    } catch (error) {
      console.error("AI service error:", error.response?.data || error.message);
      throw new Error(`AI service HTTP ${error.response?.status || 500}: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  }
}

module.exports = new AiAssessmentClient();
