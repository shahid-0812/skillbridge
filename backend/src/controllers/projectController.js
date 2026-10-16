const projectService = require("../services/projectService");

const getMyProjects = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const projects = await projectService.getProjects(candidateId);

    return res.status(200).json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addMyProject = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;

    const {
      project_name,
      description,
      role,
      technologies_used,
      start_date,
      end_date,
      project_url,
      team_size,
      is_academic_project,
    } = req.body;

    if (!project_name || !description || !role) {
      return res.status(400).json({
        success: false,
        message: "Project name, description and role are required",
      });
    }

    const project = await projectService.addProject({
      candidateId,
      projectName: project_name,
      description,
      role,
      technologiesUsed: technologies_used,
      startDate: start_date,
      endDate: end_date,
      projectUrl: project_url,
      teamSize: team_size,
      isAcademicProject: is_academic_project,
    });

    return res.status(201).json({
      success: true,
      message: "Project added successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProject = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project id",
      });
    }

    const {
      project_name,
      description,
      role,
      technologies_used,
      start_date,
      end_date,
      project_url,
      team_size,
      is_academic_project,
    } = req.body;

    if (!project_name || !description || !role) {
      return res.status(400).json({
        success: false,
        message: "Project name, description and role are required",
      });
    }

    const project = await projectService.updateProject({
      candidateId,
      projectId,
      projectName: project_name,
      description,
      role,
      technologiesUsed: technologies_used,
      startDate: start_date,
      endDate: end_date,
      projectUrl: project_url,
      teamSize: team_size,
      isAcademicProject: is_academic_project,
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteMyProject = async (req, res, next) => {
  try {
    const candidateId = req.identity.candidateId;
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project id",
      });
    }

    const project = await projectService.deleteProject({
      candidateId,
      projectId,
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProjects,
  addMyProject,
  updateMyProject,
  deleteMyProject,
};