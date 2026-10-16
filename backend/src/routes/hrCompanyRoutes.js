const express = require("express");

const {
    getCompany,
    updateCompany,
} = require("../controllers/hrCompanyController");

const authenticate = require("../middleware/authMiddleware");

const {
    authorizeHR,
} = require("../middleware/hrAuthorizationMiddleware");

const router = express.Router();

router.get(
    "/me",
    authenticate,
    authorizeHR,
    getCompany
);

router.put(
    "/me",
    authenticate,
    authorizeHR,
    updateCompany
);
module.exports = router;