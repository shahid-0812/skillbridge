const express = require("express");
const router = express.Router();

const controller = require("../controllers/realLabController");
const authenticate = require("../middleware/authMiddleware");
const { authorizeCandidate } = require("../middleware/authorizationMiddleware");

router.get("/health", controller.health);

router.post("/start", authenticate, authorizeCandidate, controller.start);

router.post("/:labId/stop", authenticate, authorizeCandidate, controller.stop);

module.exports = router;
