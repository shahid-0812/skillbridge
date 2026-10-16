const { getUserIdentity } = require("../services/identityService");

const authorizeCandidate = async (req, res, next) => {
  try {
    const identity = await getUserIdentity(req.user.sub);

    if (identity.userType !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Candidate access required",
      });
    }

    req.identity = identity;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorizeCandidate,
};