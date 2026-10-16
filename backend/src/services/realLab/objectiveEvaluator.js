"use strict";

/**
 * Objective Evaluator
 *
 * Verifies whether a RealLab task was actually completed.
 *
 * Important:
 * - Does NOT trust commands alone.
 * - Uses collected evidence and expected success conditions.
 * - Produces deterministic scoring.
 * - AI evaluation will be added separately for explanations/quality.
 */

const DEFAULT_PASS_SCORE = 100;

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function isNonEmpty(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function evaluateCondition(condition, evidence) {
  const text = normalize(condition);

  if (!text) {
    return {
      passed: false,
      reason: "Empty success condition",
    };
  }

  const evidenceText = evidence
    .map((item) =>
      [
        item.type,
        item.description,
        item.command,
        item.output,
        item.result,
        item.value,
        item.content,
      ]
        .filter(isNonEmpty)
        .join(" ")
    )
    .join(" ")
    .toLowerCase();

  /*
   * Evidence-aware matching.
   *
   * This is intentionally conservative.
   * Unknown conditions do not automatically pass.
   */

  if (
    text.includes("file exists") ||
    text.includes("file created") ||
    text.includes("created file")
  ) {
    const fileEvidence = evidence.some((item) => {
      const combined = normalize(
        [
          item.type,
          item.description,
          item.value,
          item.output,
        ]
          .filter(isNonEmpty)
          .join(" ")
      );

      return (
        combined.includes("/workspace/") ||
        combined.includes("workspace_files") ||
        combined.includes("file")
      );
    });

    return {
      passed: fileEvidence,
      reason: fileEvidence
        ? "Workspace/file evidence found"
        : "No matching workspace/file evidence found",
    };
  }

  /*
   * Explicit pass/fail evidence.
   */
  const explicitPass = evidence.some((item) => {
    const result = normalize(item.result);

    return (
      result === "pass" ||
      result === "passed" ||
      result === "success" ||
      result === "successful" ||
      result === "true"
    );
  });

  if (explicitPass) {
    return {
      passed: true,
      reason: "Explicit successful evidence found",
    };
  }

  /*
   * Basic semantic evidence matching.
   * The condition must have meaningful terms present in evidence.
   */
  const keywords = text
    .replace(/[^\w\s/-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 4);

  if (keywords.length === 0) {
    return {
      passed: false,
      reason: "Unable to derive verification criteria",
    };
  }

  const matched = keywords.filter((keyword) =>
    evidenceText.includes(keyword)
  );

  const ratio = matched.length / keywords.length;

  if (ratio >= 0.7) {
    return {
      passed: true,
      reason: `Evidence matched ${matched.length}/${keywords.length} condition terms`,
    };
  }

  return {
    passed: false,
    reason: `Evidence matched ${matched.length}/${keywords.length} condition terms`,
  };
}

function evaluateObjective({
  successConditions = [],
  evidence = [],
}) {
  if (!Array.isArray(successConditions)) {
    throw new Error("successConditions must be an array");
  }

  if (!Array.isArray(evidence)) {
    throw new Error("evidence must be an array");
  }

  if (successConditions.length === 0) {
    return {
      status: "UNVERIFIABLE",
      score: 0,
      passedConditions: 0,
      totalConditions: 0,
      conditions: [],
    };
  }

  const conditions = successConditions.map((condition) => {
    const result = evaluateCondition(condition, evidence);

    return {
      condition,
      ...result,
    };
  });

  const passedConditions = conditions.filter(
    (condition) => condition.passed
  ).length;

  const totalConditions = conditions.length;

  const score = Math.round(
    (passedConditions / totalConditions) * DEFAULT_PASS_SCORE
  );

  return {
    status: passedConditions === totalConditions ? "PASSED" : "FAILED",
    score,
    passedConditions,
    totalConditions,
    conditions,
  };
}

module.exports = {
  evaluateObjective,
};