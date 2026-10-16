const realLabService = require("../services/realLab/realLabService");

async function health(req, res, next) {
  try {
    const result = await require("../services/realLab/dockerProvisioner")
      .healthCheck();

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function start(req, res, next) {
  try {
    const {
      skill,
      difficulty,
      assessmentType,
    } = req.body;

    if (!skill) {
      return res.status(400).json({
        message: "skill is required",
      });
    }

    const result = await realLabService.startRealLab({
      skill,
      difficulty,
      assessmentType,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function stop(req, res, next) {
  try {
    const { labId } = req.params;

    if (!labId) {
      return res.status(400).json({
        message: "labId is required",
      });
    }

    const result = await realLabService.stopRealLab(labId);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  health,
  start,
  stop,
};
