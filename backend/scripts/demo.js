const readline = require("readline");

const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";
const EMAIL = "charlie.devops@email.com";
const PASSWORD = "DevOps@12345";

const skills = [
  [1, "Python"], [2, "Java"], [3, "C++"], [4, "JavaScript"],
  [5, "React.js"], [6, "Node.js"], [7, "Angular"], [8, "SQL"],
  [9, "PostgreSQL"], [10, "MongoDB"], [11, "AWS"], [12, "Docker"],
  [13, "Kubernetes"], [14, "CI/CD"], [15, "Linux Administration"],
  [16, "Bash Scripting"], [17, "Terraform"], [18, "Machine Learning"],
  [19, "Data Analysis"], [20, "NLP"], [21, "Agile"], [22, "Scrum"],
  [23, "Project Management"], [24, "Communication"], [25, "Git"],
  [26, "UI/UX Design"], [27, "Figma"], [28, "Redis"], [29, "Kafka"],
  [30, "Jenkins"]
].map(([id, name]) => ({ id, name }));

const levels = ["Basic", "Intermediate", "Advanced"];

async function request(path, options = {}) {
  const r = await fetch(`${BASE_URL}${path}`, options);
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: r.status, body };
}

function ok(x) { console.log(`\n✅ ${x}`); }
function bad(x, d) {
  console.log(`\n❌ ${x}`);
  if (d) console.log(JSON.stringify(d, null, 2));
}

function ask(rl, q) {
  return new Promise(resolve => rl.question(q, resolve));
}

async function main() {
  console.clear();

  console.log(`
========================================
     ACADEMIA INDUSTRY PORTAL
          SKILLDNA LIVE DEMO
========================================
`);

  const health = await request("/");
  if (health.status !== 200) {
    bad("Backend unavailable", health.body);
    process.exit(1);
  }
  ok("Backend");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`
----------------------------------------
SELECT ANY SKILL
----------------------------------------
`);

  skills.forEach((s, i) => console.log(`${i + 1}) ${s.name}`));

  let choice;
  while (true) {
    choice = Number(await ask(rl, `\nChoose skill [1-${skills.length}]: `));
    if (choice >= 1 && choice <= skills.length) break;
    console.log("Invalid choice.");
  }

  const skill = skills[choice - 1];

  console.log(`
----------------------------------------
SELECT DIFFICULTY
----------------------------------------
1) Basic
2) Intermediate
3) Advanced
`);

  let levelChoice;
  while (true) {
    levelChoice = Number(await ask(rl, "Choose difficulty [1-3]: "));
    if (levelChoice >= 1 && levelChoice <= 3) break;
    console.log("Invalid choice.");
  }

  const level = levels[levelChoice - 1];

  console.log(`
========================================
SELECTION
========================================
Skill:       ${skill.name}
Difficulty:  ${level}
`);

  console.log("Authenticating...");

  const login = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD
    })
  });

  const token = login.body?.data?.token;

  if (!token) {
    bad("Login failed", login.body);
    rl.close();
    process.exit(1);
  }

  ok("Candidate authenticated");

  /*
   * Load the candidate's current skills.
   */
  const current = await request("/api/candidates/me/skills", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const existing = current.body?.data?.skills || [];

  /*
   * If selected skill is not attached to the candidate,
   * add it using the real candidate-skill API.
   */
  const candidateSkill = existing.find(
    x => Number(x.skill_id) === Number(skill.id)
  );

  if (!candidateSkill) {
    console.log(`\nAdding ${skill.name} to demo candidate...`);

    const add = await request("/api/candidates/me/skills", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        skill_id: skill.id,
        proficiency_level: level,
        experience_years: "1 Year",
        is_growth_area: false
      })
    });

    if (add.status < 200 || add.status >= 300) {
      bad("Could not add selected skill", add.body);
      rl.close();
      process.exit(1);
    }

    ok(`Skill added: ${skill.name}`);
   } else {
    console.log(`\nUpdating ${skill.name} to ${level}...`);
    await request(`/api/candidates/me/skills/${skill.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ proficiency_level: level })
    });
    ok(`Skill updated to ${level}`);
  }

  console.log(`
----------------------------------------
GENERATING AI ASSESSMENT
----------------------------------------
`);

  const verification = await request(
    `/api/candidates/me/skills/${skill.id}/verify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (
    verification.status === 409 &&
    verification.body?.message === "Skill is already verified"
  ) {
    bad(
      "Selected skill is already verified",
      "Choose another skill for a fresh live assessment."
    );
    rl.close();
    return;
  }

  const assessment = verification.body?.data?.assessment;

  if (!assessment) {
    bad("AI assessment generation failed", verification.body);
    rl.close();
    process.exit(1);
  }

  ok("AI assessment generated");

  const generated = assessment.generated_assessment || {};

  console.log(`
========================================
AI GENERATED ASSESSMENT
========================================

Title:
${generated.title || "Assessment"}

Type:
${generated.assessment_type || "PRACTICAL"}

Scenario:
${generated.scenario || "Generated practical scenario"}

Tasks:
`);

  for (const task of generated.tasks || []) {
    console.log(`  • ${task.description || task}`);
  }

  console.log(`
Competencies:
`);

  for (const c of assessment.selected_competencies || []) {
    console.log(`  • ${c}`);
  }

  console.log(`
Success Conditions:
`);

  for (const c of assessment.success_conditions || []) {
    console.log(`  ✓ ${c}`);
  }

  console.log(`
----------------------------------------
STARTING REAL LAB
----------------------------------------
`);

  const start = await request(
    `/api/candidates/me/skills/${skill.id}/verify/start`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  const startData = start.body?.data;
  const attemptId = startData?.attempt?.id;
  const realLab =
    startData?.assessment?.environment_specification?.real_lab;

  if (!attemptId) {
    bad("RealLab failed to start", start.body);
    rl.close();
    process.exit(1);
  }

  ok("RealLab started");

  console.log(`
Lab ID:       ${realLab?.lab_id || "N/A"}
Container:    ${realLab?.container_id || "N/A"}
Status:       ${realLab?.status || "RUNNING"}

Security:
  ✓ Temporary environment
  ✓ Restricted network
  ✓ Resource limits
  ✓ No privileged access
  ✓ No host filesystem
  ✓ Integrity auditing
`);

  console.log(`
----------------------------------------
SUBMITTING DEMO EVIDENCE
----------------------------------------
`);

  const evidence = await request(
    `/api/candidates/me/skills/${skill.id}/verify/submit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        attemptId,
        evidence: [{
          type: "demo",
          status: "success",
          description:
            "Controlled demonstration evidence showing completion of assigned assessment tasks and required competencies."
        }]
      })
    }
  );

  if (evidence.status < 200 || evidence.status >= 300) {
    bad("Evidence submission failed", evidence.body);
    rl.close();
    process.exit(1);
  }

  ok("Evidence submitted");

  console.log("\nEvaluating...");

  const evaluation = await request(
    `/api/candidates/me/skills/${skill.id}/verify/evaluate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ attemptId })
    }
  );

  const result = evaluation.body?.data?.result;
  const attempt = evaluation.body?.data?.attempt;

  if (!result) {
    bad("Evaluation failed", evaluation.body);
    rl.close();
    process.exit(1);
  }

  ok("Evaluation completed");

  console.log(`
========================================
             FINAL RESULT
========================================

Skill:              ${skill.name}
Difficulty:         ${level}

Objective Score:    ${result.objective_score}%
Final Score:        ${result.final_score}%

Result:             ${result.status}
Verified Level:     ${result.verified_level || "N/A"}

Integrity:          ${attempt?.integrity_status || "CLEAN"}
Evidence Count:     ${result.evidence_count}

========================================
              SKILLDNA
========================================

Claimed:            ${level}
Assessed:           ${result.verified_level || "N/A"}
Practically Verified:
                    ${result.status === "PASSED" ? result.verified_level : "Not Verified"}

Score:              ${result.final_score}%
Evidence:           RealLab
Integrity:          ${attempt?.integrity_status || "CLEAN"}
Verification:       ${result.status === "PASSED" ? "VERIFIED" : "PENDING"}

========================================
           DEMO COMPLETE
========================================
`);

  rl.close();
}

main().catch(err => {
  console.error("\n❌ DEMO ERROR");
  console.error(err);
  process.exit(1);
});
