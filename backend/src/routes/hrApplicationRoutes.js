const express = require("express");
const { getCompanyApplications } = require("../controllers/hrApplicationController");
const authenticate = require("../middleware/authMiddleware");
const { authorizeHR } = require("../middleware/hrAuthorizationMiddleware");

const router = express.Router();

router.get("/", authenticate, authorizeHR, getCompanyApplications);

module.exports = router;
