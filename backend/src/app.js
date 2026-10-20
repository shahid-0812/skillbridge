const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const candidateSkillRoutes = require("./routes/candidateSkillRoutes");
const skillRoutes = require("./routes/skillRoutes");
const targetRoleRoutes = require("./routes/targetRoleRoutes");
const careerPreferenceRoutes = require("./routes/careerPreferenceRoutes");
const preferredIndustryRoutes = require("./routes/preferredIndustryRoutes");
const preferredLocationRoutes = require("./routes/preferredLocationRoutes");
const preferredWorkSettingRoutes = require("./routes/preferredWorkSettingRoutes");
const workExperienceRoutes = require("./routes/workExperienceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const profileCompletionRoutes = require("./routes/profileCompletionRoutes");
const skillVerificationRoutes = require("./routes/skillVerificationRoutes");
const realLabRoutes = require("./routes/realLabRoutes");
const educationRoutes = require("./routes/educationRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const hrAuthRoutes = require("./routes/hrAuthRoutes");
const hrCompanyRoutes = require("./routes/hrCompanyRoutes");
const hrJobRoutes = require("./routes/hrJobRoutes");
const jobRoutes = require("./routes/jobRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const authenticate = require("./middleware/authMiddleware");
const { getUserIdentity } = require("./services/identityService");
const applicationRoutes = require("./routes/applicationRoutes");
const applicationAssessmentRoutes = require("./routes/applicationAssessmentRoutes");
const hrApplicationRoutes = require("./routes/hrApplicationRoutes");


const {
  authorizeCandidate,
} = require("./middleware/authorizationMiddleware");

const app = express();

const corsOrigins = String(process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/hr/jobs", hrJobRoutes);

/*
 * Root / health endpoint
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Academia Industry Portal API is running",
  });
});

/*
 * Authentication routes
 */
app.use("/api/auth", authRoutes);

/*
 * Authenticated user identity
 */
app.get("/api/auth/me", authenticate, async (req, res, next) => {
  try {
    const identity = await getUserIdentity(req.user.sub);

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        identity,
      },
    });
  } catch (error) {
    next(error);
  }
});

// HR ROUTES

app.use("/api/hr-auth", hrAuthRoutes);

app.use("/api/hr/company", hrCompanyRoutes);

app.use("/api/hr/jobs", hrJobRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/hr/applications", hrApplicationRoutes);

app.use(
    "/api/candidate/applications",
    applicationRoutes
);

app.use(
    "/api/candidate/applications",
    applicationAssessmentRoutes
);

/*
 * Candidate profile APIs
 */
app.use("/api/candidates", candidateRoutes);

/*
 * Candidate skills APIs
 */
app.use("/api/candidates", candidateSkillRoutes);

/*
 * Skills master APIs
 */
app.use("/api/skills", skillRoutes);

/*
 * Candidate target role APIs
 */

app.use("/api/candidates", targetRoleRoutes);

/*
 * Candidate career preferences APIs
 */
app.use("/api/candidates", careerPreferenceRoutes);

/*
 * Preferred industries APIs
 */
app.use("/api/candidates", preferredIndustryRoutes);

/*
 * Preferred locations APIs
 */
app.use("/api/candidates", preferredLocationRoutes);

/*
 * Preferred work settings APIs
 */
app.use("/api/candidates", preferredWorkSettingRoutes);

/*
 * Work experience APIs
 */
app.use("/api/candidates", workExperienceRoutes);

/*
 * Project APIs
 */
app.use("/api/candidates", projectRoutes);


/*
 * Education APIs
 */
app.use("/api/candidates", educationRoutes);

/*
 * Internship APIs
 */
app.use("/api/candidates", internshipRoutes);

/*
 * Candidate profile completion APIs
 */
app.use("/api/candidates", profileCompletionRoutes);

/*
 * Candidate skill verification APIs
 */
app.use("/api/real-labs", realLabRoutes);
app.use("/api/candidates", skillVerificationRoutes);

/*
 * Temporary authorization test endpoint
 */
app.get(
  "/api/test/candidate",
  authenticate,
  authorizeCandidate,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Candidate authorization successful",
      identity: req.identity,
    });
  }
);



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not found",
    code: "NOT_FOUND",
  });
});

/*
 * Central error handler
 */
app.use(errorMiddleware);

module.exports = app;
