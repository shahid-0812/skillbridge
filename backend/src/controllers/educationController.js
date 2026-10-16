const {
  getEducationByCandidateId,
  createEducation,
  updateEducation,
  deleteEducation,
} = require("../services/educationService");


const getMyEducation = async (req, res, next) => {
  try {
    const education = await getEducationByCandidateId(
      req.identity.candidateId
    );

    return res.status(200).json({
      success: true,
      data: {
        education,
      },
    });
  } catch (error) {
    next(error);
  }
};


const addEducation = async (req, res, next) => {
  try {
    const education = await createEducation(
      req.identity.candidateId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Education added successfully",
      data: {
        education,
      },
    });
  } catch (error) {
    next(error);
  }
};


const updateMyEducation = async (req, res, next) => {
  try {
    const educationId = Number(req.params.id);

    if (!Number.isInteger(educationId) || educationId <= 0) {
      const error = new Error("Invalid education ID");
      error.statusCode = 400;
      throw error;
    }

    const education = await updateEducation(
      req.identity.candidateId,
      educationId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Education updated successfully",
      data: {
        education,
      },
    });
  } catch (error) {
    next(error);
  }
};


const deleteMyEducation = async (req, res, next) => {
  try {
    const educationId = Number(req.params.id);

    if (!Number.isInteger(educationId) || educationId <= 0) {
      const error = new Error("Invalid education ID");
      error.statusCode = 400;
      throw error;
    }

    await deleteEducation(
      req.identity.candidateId,
      educationId
    );

    return res.status(200).json({
      success: true,
      message: "Education deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getMyEducation,
  addEducation,
  updateMyEducation,
  deleteMyEducation,
};