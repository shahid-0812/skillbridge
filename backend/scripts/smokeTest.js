const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";

const EMAIL = "charlie.devops@email.com";
const PASSWORD = "DevOps@12345";
const SKILL_ID = 13;

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);

  const text = await response.text();

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return {
    status: response.status,
    body,
  };
}

function pass(name, detail = "") {
  console.log(`✅ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  console.log(`❌ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  console.log("\n========================================");
  console.log(" Academia Industry Portal Backend Test");
  console.log("========================================\n");

  // 1. Backend
  const health = await request("/");

  if (health.status === 200 && health.body?.success) {
    pass("Backend health");
  } else if (verification.status === 409 && verification.body?.message === "Skill is already verified") {
    pass("Skill verification", "Already verified from previous successful run");
  } else if (verification.status === 409 && verification.body?.message === "Skill is already verified") {
    pass("Skill verification", "Already verified");
  } else {
    fail("Backend health", JSON.stringify(health.body));
    process.exit(1);
  }

  // 2. Login
  const login = await request("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    }),
  });

  const token = login.body?.data?.token;

  if (login.status === 200 && token) {
    pass("Candidate login");
  } else if (verification.status === 409 && verification.body?.message === "Skill is already verified") {
    pass("Skill verification", "Already verified");
  } else {
    fail("Candidate login", JSON.stringify(login.body));
    process.exit(1);
  }

  // 3. Candidate authorization
  const authTest = await request("/api/test/candidate", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (authTest.status === 200 && authTest.body?.success) {
    pass("JWT candidate authorization");
  } else if (verification.status === 409 && verification.body?.message === "Skill is already verified") {
    pass("Skill verification", "Already verified");
  } else {
    fail(
      "JWT candidate authorization",
      `HTTP ${authTest.status}: ${JSON.stringify(authTest.body)}`
    );
    process.exit(1);
  }

  // 4. Skill verification
  console.log("\nCalling Kubernetes verification endpoint...");
  console.log(`POST /api/candidates/me/skills/${SKILL_ID}/verify\n`);

  const verification = await request(
    `/api/candidates/me/skills/${SKILL_ID}/verify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (verification.status >= 200 && verification.status < 300) {
    pass("Skill verification");

    const data = verification.body?.data;

    if (data?.assessment) {
      pass("AI assessment generated");
      pass("Assessment returned to backend");
    } else if (verification.status === 409 && verification.body?.message === "Skill is already verified") {
    pass("Skill verification", "Already verified");
  } else {
      fail("AI assessment generated", "No assessment returned");
      process.exit(1);
    }
  } else if (verification.status === 409 && verification.body?.message === "Skill is already verified") {
    pass("Skill verification", "Already verified");
  } else {
    fail(
      "Skill verification",
      `HTTP ${verification.status}: ${JSON.stringify(
        verification.body,
        null,
        2
      )}`
    );
    process.exit(1);
  }

  console.log("\n========================================");
  console.log(" RESULT: PASS");
  console.log("========================================\n");
}

main().catch((error) => {
  console.error("\n❌ TEST RUNNER ERROR");
  console.error(error);
  process.exit(1);
});
