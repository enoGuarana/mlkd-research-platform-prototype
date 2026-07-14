const { execFileSync, spawnSync } = require("child_process");
const { writeFileSync, unlinkSync } = require("fs");
const { join } = require("path");

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function stagedFiles() {
  const output = git(["diff", "--cached", "--name-status"]);
  if (!output) return [];

  return output.split("\n").map((line) => {
    const [status, ...pathParts] = line.split(/\s+/);
    return {
      status,
      path: pathParts.join(" "),
    };
  });
}

function pickScope(files) {
  const paths = files.map((file) => file.path);

  const rules = [
    ["docs", (path) => path.endsWith("README.md") || path.startsWith("docs/") || path === ".gitmessage"],
    ["prisma", (path) => path.startsWith("prisma/")],
    ["admin", (path) => path.startsWith("app/admin/") || path.includes("Admin")],
    ["publications", (path) => path.includes("publication") || path.includes("Publication")],
    ["team", (path) => path.includes("team") || path.includes("members")],
    ["auth", (path) => path.includes("auth") || path.includes("middleware")],
    ["ingestion", (path) => path.includes("ingest") || path.includes("openalex")],
    ["ui", (path) => path.startsWith("components/") || path.endsWith(".css")],
    ["scripts", (path) => path.startsWith("scripts/")],
  ];

  const matches = rules
    .map(([scope, predicate]) => ({
      scope,
      count: paths.filter(predicate).length,
    }))
    .filter((match) => match.count > 0)
    .sort((a, b) => b.count - a.count);

  return matches[0]?.scope ?? "project";
}

function pickType(files) {
  const paths = files.map((file) => file.path);

  if (paths.every((path) => path.endsWith("README.md") || path.startsWith("docs/") || path === ".gitmessage")) {
    return "docs";
  }

  if (paths.some((path) => path.startsWith("prisma/migrations/") || path === "prisma/schema.prisma")) {
    return "feat";
  }

  if (paths.some((path) => path.startsWith("app/") || path.startsWith("components/") || path.startsWith("lib/"))) {
    return "feat";
  }

  if (paths.some((path) => path === "package.json" || path.startsWith("scripts/"))) {
    return "chore";
  }

  return "chore";
}

function describeStatus(files) {
  const added = files.filter((file) => file.status.startsWith("A")).length;
  const modified = files.filter((file) => file.status.startsWith("M")).length;
  const deleted = files.filter((file) => file.status.startsWith("D")).length;

  return [
    added ? `${added} added` : null,
    modified ? `${modified} modified` : null,
    deleted ? `${deleted} deleted` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

function subjectFor(type, scope, files) {
  const paths = files.map((file) => file.path);

  if (
    paths.some((path) => path.startsWith("app/admin/publications")) ||
    (paths.some((path) => path.includes("Publication")) && paths.some((path) => path.includes("Admin")))
  ) {
    return "add manual admin content management";
  }

  if (scope === "team" && paths.some((path) => path.includes("uploads") || path.includes("team"))) {
    return "add member photo uploads";
  }

  if (paths.some((path) => path === "scripts/commit-auto.js")) {
    return "automate commit message generation";
  }

  if (scope === "prisma") {
    return "update data model";
  }

  if (type === "docs") {
    return "update project documentation";
  }

  return `update ${scope} workflow`;
}

function buildMessage(files) {
  const type = pickType(files);
  const scope = pickScope(files);
  const subject = subjectFor(type, scope, files);
  const fileList = files.slice(0, 8).map((file) => `- ${file.path}`);
  const overflow = files.length > 8 ? [`- and ${files.length - 8} more file(s)`] : [];

  return [
    `${type}(${scope}): ${subject}`,
    "",
    "Why:",
    `- Keep the ${scope} implementation clear and maintainable.`,
    "",
    "What changed:",
    `- Updated staged files (${describeStatus(files)}).`,
    ...fileList,
    ...overflow,
    "",
    "Validation:",
    "- Not run by commit:auto.",
    "",
  ].join("\n");
}

function main() {
  let files;
  try {
    files = stagedFiles();
  } catch (error) {
    console.error("Unable to inspect staged changes.");
    console.error(error.message);
    process.exit(1);
  }

  if (!files.length) {
    console.error("No staged changes found. Run git add first.");
    process.exit(1);
  }

  const message = buildMessage(files);
  const messagePath = join(process.cwd(), ".git", "AUTO_COMMIT_MSG");
  writeFileSync(messagePath, message);

  console.log("Generated commit message:");
  console.log("");
  console.log(message);

  const result = spawnSync("git", ["commit", "-F", messagePath], { stdio: "inherit" });

  try {
    unlinkSync(messagePath);
  } catch {
    // Ignore cleanup failures; Git already consumed the message file.
  }

  process.exit(result.status ?? 1);
}

main();
