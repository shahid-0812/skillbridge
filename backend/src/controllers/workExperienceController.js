const workExperienceService = require("../services/workExperienceService");

const getMyWorkExperiences = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const experiences =
      await workExperienceService.getWorkExperiences(candidateId);

    return res.status(200).json({
      success: true,
      data: {
        experiences,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addMyWorkExperience = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const {
      company_name,
      role,
      description,
      start_date,
      end_date,
      is_current,
      location,
      work_setting,
      technologies_used,
      certificate_url,
      experience_url,
    } = req.body;

    if (!company_name || !role || !description || !start_date) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, role, description and start date are required",
      });
    }

    if (is_current !== true && !end_date) {
      return res.status(400).json({
        success: false,
        message:
          "End date is required when the work experience is not current",
      });
    }

    const experience =
      await workExperienceService.addWorkExperience({
        candidateId,
        companyName: company_name,
        role,
        description,
        startDate: start_date,
        endDate: end_date,
        isCurrent: is_current,
        location,
        workSetting: work_setting,
        technologiesUsed: technologies_used,
        certificateUrl: certificate_url,
        experienceUrl: experience_url,
      });

    return res.status(201).json({
      success: true,
      message: "Work experience added successfully",
      data: {
        experience,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyWorkExperience = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const experienceId = Number(req.params.id);

    if (!Number.isInteger(experienceId) || experienceId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid work experience id",
      });
    }

    const {
      company_name,
      role,
      description,
      start_date,
      end_date,
      is_current,
      location,
      work_setting,
      technologies_used,
      certificate_url,
      experience_url,
    } = req.body;

    if (!company_name || !role || !description || !start_date) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, role, description and start date are required",
      });
    }

    if (is_current !== true && !end_date) {
      return res.status(400).json({
        success: false,
        message:
          "End date is required when the work experience is not current",
      });
    }

    const experience =
      await workExperienceService.updateWorkExperience({
        candidateId,
        experienceId,
        companyName: company_name,
        role,
        description,
        startDate: start_date,
        endDate: end_date,
        isCurrent: is_current,
        location,
        workSetting: work_setting,
        technologiesUsed: technologies_used,
        certificateUrl: certificate_url,
        experienceUrl: experience_url,
      });

    return res.status(200).json({
      success: true,
      message: "Work experience updated successfully",
      data: {
        experience,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteMyWorkExperience = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const experienceId = Number(req.params.id);

    if (!Number.isInteger(experienceId) || experienceId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid work experience id",
      });
    }

    const experience =
      await workExperienceService.deleteWorkExperience({
        candidateId,
        experienceId,
      });

    return res.status(200).json({
      success: true,
      message: "Work experience deleted successfully",
      data: {
        experience,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyWorkExperiences,
  addMyWorkExperience,
  updateMyWorkExperience,
  deleteMyWorkExperience,
};