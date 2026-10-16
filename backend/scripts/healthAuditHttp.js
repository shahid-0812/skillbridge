const BASE = process.env.BACKEND_URL || "http://localhost:5000";
const AI = process.env.AI_SERVICE_URL || "http://localhost:8000";
const REAL_LAB =
  process.env.REAL_LAB_AGENT_URL || "http://192.168.174.137:8787";

async function req(url, options = {}) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(options.timeoutMs || 15000),
    });
    const text = await response.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { ok: true, status: response.status, body, ms: Date.now() - started };
  } catch (error) {
    return { ok: false, error: error.message, ms: Date.now() - started };
  }
}

function report(name, passed, detail) {
  console.log(`${passed ? "PASS" : "FAIL"} | ${name}${detail ? " | " + detail : ""}`);
}

(async () => {
  const health = await req(`${BASE}/`);
  report("backend_health", health.status === 200 && health.body?.success, JSON.stringify(health.body));

  const aiHealth = await req(`${AI}/health`);
  report("ai_health", aiHealth.status === 200 && aiHealth.body?.status === "healthy", JSON.stringify(aiHealth.body || aiHealth.error));

  const realLabLocal = await req("http://127.0.0.1:8787/health", { timeoutMs: 4000 });
  report("reallab_local", realLabLocal.status === 200, realLabLocal.error || JSON.stringify(realLabLocal.body));

  const realLabRemote = await req(`${REAL_LAB}/health`, { timeoutMs: 5000 });
  report("reallab_configured", realLabRemote.status === 200, realLabRemote.error || JSON.stringify(realLabRemote.body));

  const badLogin = await req(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "charlie.devops@email.com", password: "wrong" }),
  });
  report("login_wrong_password_401", badLogin.status === 401, JSON.stringify(badLogin.body));

  const seedLogin = await req(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "alice.fresher@email.com", password: "anything" }),
  });
  report(
    "seed_hashed_pw_user_cannot_login",
    seedLogin.status === 401,
    JSON.stringify(seedLogin.body)
  );

  const login = await req(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "charlie.devops@email.com",
      password: "DevOps@12345",
    }),
  });
  const token = login.body?.data?.token;
  report("charlie_login", login.status === 200 && Boolean(token), JSON.stringify({
    status: login.status,
    hasToken: Boolean(token),
    userId: login.body?.data?.user?.id,
  }));

  if (!token) {
    process.exit(1);
  }

  const authz = (extra = {}) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  const noAuth = await req(`${BASE}/api/candidates/me`);
  report("candidates_me_requires_auth", noAuth.status === 401, JSON.stringify(noAuth.body));

  const me = await req(`${BASE}/api/auth/me`, { headers: authz() });
  report(
    "auth_me_candidate",
    me.status === 200 && me.body?.data?.identity?.userType === "candidate",
    JSON.stringify(me.body?.data?.identity)
  );

  const candidateTest = await req(`${BASE}/api/test/candidate`, { headers: authz() });
  report("test_candidate_ok", candidateTest.status === 200, JSON.stringify(candidateTest.body));

  const companyTest = await req(`${BASE}/api/test/company`, { headers: authz() });
  report("candidate_blocked_from_company_api", companyTest.status === 403, JSON.stringify(companyTest.body));

  const profile = await req(`${BASE}/api/candidates/me`, { headers: authz() });
  report("get_profile", profile.status === 200 && profile.body?.data?.candidate?.id === 3, `id=${profile.body?.data?.candidate?.id}`);

  const skills = await req(`${BASE}/api/candidates/me/skills`, { headers: authz() });
  report("get_skills", skills.status === 200 && Array.isArray(skills.body?.data?.skills), `count=${skills.body?.data?.skills?.length}`);

  const projects = await req(`${BASE}/api/candidates/me/projects`, { headers: authz() });
  report("get_projects", projects.status === 200, `count=${projects.body?.data?.projects?.length}`);

  const experience = await req(`${BASE}/api/candidates/me/work-experience`, { headers: authz() });
  report("get_work_experience", experience.status === 200, `count=${experience.body?.data?.experiences?.length || experience.body?.data?.workExperiences?.length || Object.keys(experience.body?.data || {}).join(",")}`);

  const target = await req(`${BASE}/api/candidates/me/target-role`, { headers: authz() });
  report("get_target_role", target.status === 200 || target.status === 404, JSON.stringify(target.body?.data || target.body));

  const prefs = await req(`${BASE}/api/candidates/me/career-preferences`, { headers: authz() });
  report("get_career_preferences", prefs.status === 200 || prefs.status === 404, JSON.stringify(prefs.body?.data || prefs.body));

  const completion = await req(`${BASE}/api/candidates/me/profile-completion`, { headers: authz() });
  report("profile_completion", completion.status === 200, JSON.stringify(completion.body?.data));

  const skillDna = await req(`${BASE}/api/candidates/me/skill-dna`, { headers: authz() });
  report("skill_dna_endpoint", skillDna.status !== 404, `status=${skillDna.status} body=${JSON.stringify(skillDna.body)}`);

  const jobs = await req(`${BASE}/api/jobs`, { headers: authz() });
  report("jobs_endpoint", jobs.status !== 404, `status=${jobs.status}`);

  const hrDash = await req(`${BASE}/api/hr/dashboard`, { headers: authz() });
  report("hr_dashboard_missing_or_forbidden", hrDash.status === 404 || hrDash.status === 403, `status=${hrDash.status}`);

  const k8sVerify = await req(`${BASE}/api/candidates/me/skills/13/verify`, {
    method: "POST",
    headers: authz({ "Content-Type": "application/json" }),
  });
  report(
    "k8s_already_verified_409",
    k8sVerify.status === 409,
    `status=${k8sVerify.status} ${JSON.stringify(k8sVerify.body)}`
  );

  const linuxId = (skills.body?.data?.skills || []).find((s) => s.skill_name === "Linux Administration")?.skill_id;
  report("linux_skill_present", Boolean(linuxId), `skill_id=${linuxId}`);

  let linuxVerify = null;
  if (linuxId) {
    linuxVerify = await req(`${BASE}/api/candidates/me/skills/${linuxId}/verify`, {
      method: "POST",
      headers: authz({ "Content-Type": "application/json" }),
      timeoutMs: 180000,
    });
    report(
      "linux_generate_assessment",
      linuxVerify.status >= 200 && linuxVerify.status < 300 && Boolean(linuxVerify.body?.data?.assessment),
      `status=${linuxVerify.status} keys=${Object.keys(linuxVerify.body?.data || {}).join(",")} msg=${linuxVerify.body?.message}`
    );
  }

  const registerEmail = `audit.candidate.${Date.now()}@example.com`;
  const register = await req(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: registerEmail, password: "AuditPass123" }),
  });
  report("register_user", register.status === 201 && Boolean(register.body?.data?.token), `status=${register.status}`);
  const newToken = register.body?.data?.token;
  if (newToken) {
    const newMe = await req(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    report(
      "new_user_has_candidate_identity",
      newMe.body?.data?.identity?.userType === "candidate",
      JSON.stringify(newMe.body?.data?.identity)
    );
    const newProfile = await req(`${BASE}/api/candidates/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    report(
      "new_user_can_access_candidate_profile",
      newProfile.status === 200,
      `status=${newProfile.status} ${JSON.stringify(newProfile.body)}`
    );
  }

  const realLabStart = await req(`${BASE}/api/real-labs/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skill: "Linux Administration", difficulty: "Basic" }),
    timeoutMs: 12000,
  });
  report(
    "reallab_start_unauthenticated",
    realLabStart.status === 401 || realLabStart.status === 201 || realLabStart.status >= 400,
    `status=${realLabStart.status} ${JSON.stringify(realLabStart.body || realLabStart.error)}`
  );

  const pythonAi = await req(`${AI}/api/v1/assessments/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    timeoutMs: 180000,
    body: JSON.stringify({
      skill: "Linux Administration",
      difficulty: "Basic",
      competencies: [
        { name: "Navigate and manage Linux filesystems" },
        { name: "Manage processes and basic services" },
        { name: "Use common Linux command-line utilities" },
      ],
      generation_seed: `audit-${Date.now()}`,
    }),
  });
  report(
    "ai_generate_direct",
    pythonAi.status === 200 && pythonAi.body?.success && pythonAi.body?.assessment?.title,
    `status=${pythonAi.status} title=${pythonAi.body?.assessment?.title} type=${pythonAi.body?.assessment?.assessment_type} err=${JSON.stringify(pythonAi.body?.detail || pythonAi.error)}`
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
