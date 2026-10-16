const pool = require("../config/db");

const getProfileCompletion = async (candidateId) => {
  // 1. Basic candidate profile
  const candidateResult = await pool.query(
    `SELECT
       id,
       profile_photo_url,
       professional_headline,
       phone_number,
       country,
       state,
       city,
       professional_summary,
       resume_url,
       linkedin_url,
       github_url,
       personal_website_url
     FROM candidates
     WHERE id = $1`,
    [candidateId]
  );

  if (candidateResult.rows.length === 0) {
    const error = new Error("Candidate not found");
    error.statusCode = 404;
    throw error;
  }

  const candidate = candidateResult.rows[0];

  // 2. Education
  const educationResult = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM candidate_education
     WHERE candidate_id = $1`,
    [candidateId]
  );

  // 3. Projects
  const projectResult = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM projects
     WHERE candidate_id = $1`,
    [candidateId]
  );

  // 4. Internships
  const internshipResult = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM internships
     WHERE candidate_id = $1`,
    [candidateId]
  );

  // 5. Work experience
  const workExperienceResult = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM work_experience
     WHERE candidate_id = $1`,
    [candidateId]
  );

  // 6. Skills
  const skillResult = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM candidate_skills
     WHERE candidate_id = $1`,
    [candidateId]
  );

  // 7. Target roles
  const targetRoleResult = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM candidate_target_roles
     WHERE candidate_id = $1`,
    [candidateId]
  );

  // 8. Preferred locations
  const locationResult = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM candidate_preferred_locations
     WHERE candidate_id = $1`,
    [candidateId]
  );

  // 9. Preferred work settings
  const workSettingResult = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM candidate_preferred_work_settings
     WHERE candidate_id = $1`,
    [candidateId]
  );

  // 10. Preferred industries
  const industryResult = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM candidate_preferred_industries
     WHERE candidate_id = $1`,
    [candidateId]
  );

  const educationCount = educationResult.rows[0].count;
  const projectCount = projectResult.rows[0].count;
  const internshipCount = internshipResult.rows[0].count;
  const workExperienceCount = workExperienceResult.rows[0].count;
  const skillCount = skillResult.rows[0].count;
  const targetRoleCount = targetRoleResult.rows[0].count;
  const locationCount = locationResult.rows[0].count;
  const workSettingCount = workSettingResult.rows[0].count;
  const industryCount = industryResult.rows[0].count;

  /*
   * Required profile sections
   *
   * Education, projects, internships and work experience
   * are optional because a general candidate may not have
   * any of them.
   *
   * The core profile sections are:
   * Basic Profile
   * Location
   * About
   * Resume
   * Skills
   * Career Preferences
   */

  const sections = {
    basicProfile: Boolean(
      candidate.profile_photo_url &&
      candidate.professional_headline &&
      candidate.phone_number
    ),

    location: Boolean(
      candidate.country &&
      candidate.state &&
      candidate.city
    ),

    about: Boolean(candidate.professional_summary),

    resume: Boolean(candidate.resume_url),

    socialLinks: Boolean(
      candidate.linkedin_url ||
      candidate.github_url ||
      candidate.personal_website_url
    ),

    skills: skillCount > 0,

    careerPreferences:
      targetRoleCount > 0 &&
      locationCount > 0 &&
      workSettingCount > 0 &&
      industryCount > 0,
  };

  const totalSections = Object.keys(sections).length;

  const completedSections = Object.values(sections).filter(
    Boolean
  ).length;

  const completionPercentage = Math.round(
    (completedSections / totalSections) * 100
  );

  return {
    candidateId: candidate.id,

    completionPercentage,

    completedSections,

    totalSections,

    sections,

    counts: {
      education: educationCount,
      projects: projectCount,
      internships: internshipCount,
      workExperience: workExperienceCount,
      skills: skillCount,
      targetRoles: targetRoleCount,
      preferredLocations: locationCount,
      preferredWorkSettings: workSettingCount,
      preferredIndustries: industryCount,
    },
  };
};

module.exports = {
  getProfileCompletion,
};