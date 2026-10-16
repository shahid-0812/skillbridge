const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const { authorizeCandidate } = require("../middleware/authorizationMiddleware");

const { getPublishedJobs } = require("../controllers/jobController");

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorizeCandidate,
    getPublishedJobs
);

module.exports = router;