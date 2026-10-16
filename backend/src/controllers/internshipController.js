const internshipService = require("../services/internshipService");

const getMyInternships = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const internships = await internshipService.getInternships(
      candidateId
    );

    return res.status(200).json({
      success: true,
      data: {
        internships,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addMyInternship = async (req, res, next) => {
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
      internship_url,
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
          "End date is required when the internship is not current",
      });
    }

    const internship = await internshipService.addInternship({
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
      internshipUrl: internship_url,
    });

    return res.status(201).json({
      success: true,
      message: "Internship added successfully",
      data: {
        internship,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyInternship = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const internshipId = Number(req.params.id);

    if (!Number.isInteger(internshipId) || internshipId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid internship id",
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
      internship_url,
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
          "End date is required when the internship is not current",
      });
    }

    const internship = await internshipService.updateInternship({
      candidateId,
      internshipId,
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
      internshipUrl: internship_url,
    });

    return res.status(200).json({
      success: true,
      message: "Internship updated successfully",
      data: {
        internship,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteMyInternship = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const internshipId = Number(req.params.id);

    if (!Number.isInteger(internshipId) || internshipId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid internship id",
      });
    }

    const internship = await internshipService.deleteInternship({
      candidateId,
      internshipId,
    });

    return res.status(200).json({
      success: true,
      message: "Internship deleted successfully",
      data: {
        internship,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyInternships,
  addMyInternship,
  updateMyInternship,
  deleteMyInternship,
};