const { execFileSync } = require("child_process");
const { mkdirSync, readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

function run(command, args, fallback = "") {
  try {
    return execFileSync(command, args, { encoding: "utf8" }).trim();
  } catch {
    return fallback;
  }
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

function section(title, body) {
  return [`## ${title}`, "", body || "_Not available._", ""].join("\n");
}

function bulletList(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "_None._";
}

function codeBlock(value, language = "txt") {
  return ["```" + language, value || "", "```"].join("\n");
}

function packageSummary() {
  const pkg = readJson("package.json");
  const scripts = Object.entries(pkg.scripts ?? {}).map(([name, command]) => `${name}: \`${command}\``);
  const dependencies = Object.entries(pkg.dependencies ?? {}).map(([name, version]) => `${name}@${version}`);

  return [
    `Name: \`${pkg.name ?? "unknown"}\``,
    `Version: \`${pkg.version ?? "unknown"}\``,
    "",
    "Scripts:",
    bulletList(scripts),
    "",
    "Dependencies:",
    bulletList(dependencies),
  ].join("\n");
}

function currentArchitectureSummary() {
  return [
    "- Next.js 14 App Router application.",
    "- Prisma with local SQLite for the current MVP.",
    "- Admin area protected by signed HTTP-only session cookies.",
    "- Admin CRUD for members, projects, publications, events, dissertations, and open positions.",
    "- DOI ingestion through OpenAlex from both UI and CLI.",
    "- Manual publication editing supports records without DOI or OpenAlex ID.",
    "- Member photo uploads are stored under `public/uploads/members`.",
    "- Target architecture includes PostgreSQL, pgvector, async workers, AI services, hybrid search, RAG, RBAC, and observability.",
  ].join("\n");
}

function importantFiles() {
  return [
    "README.md",
    "app/admin/page.js",
    "app/admin/publications/page.js",
    "app/api/publications/ingest/route.js",
    "components/AdminContentForms.js",
    "components/AdminIngestionPanel.js",
    "components/PublicationsPanel.js",
    "lib/admin-content-actions.js",
    "lib/auth.js",
    "lib/content.js",
    "lib/publications.js",
    "middleware.js",
    "prisma/schema.prisma",
    "scripts/openalex-client.js",
    "scripts/ingest-openalex.js",
    "scripts/commit-auto.js",
    "scripts/context-summary.js",
  ];
}

function main() {
  const outputArgIndex = process.argv.indexOf("--output");
  const outputPath =
    outputArgIndex >= 0 && process.argv[outputArgIndex + 1]
      ? process.argv[outputArgIndex + 1]
      : join("docs", "context", "handoff-summary.md");

  const branch = run("git", ["branch", "--show-current"], "unknown");
  const status = run("git", ["status", "--short", "--branch"], "unknown");
  const latestCommits = run("git", ["log", "--oneline", "--decorate", "--max-count=8"], "");
  const staged = run("git", ["diff", "--cached", "--stat"], "");
  const unstaged = run("git", ["diff", "--stat"], "");
  const untracked = run("git", ["ls-files", "--others", "--exclude-standard"], "");

  const generatedAt = new Date().toISOString();
  const content = [
    "# Codex Handoff Summary",
    "",
    `Generated at: \`${generatedAt}\``,
    `Repository: \`${process.cwd()}\``,
    `Branch: \`${branch}\``,
    "",
    section("How To Use This", "Paste this summary into a new Codex/GPT session before asking it to continue work on this repository."),
    section("Current Project Context", currentArchitectureSummary()),
    section("Package", packageSummary()),
    section("Git Status", codeBlock(status)),
    section("Latest Commits", codeBlock(latestCommits)),
    section("Staged Diff Summary", codeBlock(staged || "No staged changes.")),
    section("Unstaged Diff Summary", codeBlock(unstaged || "No unstaged changes.")),
    section("Untracked Files", codeBlock(untracked || "No untracked files.")),
    section("Important Files", bulletList(importantFiles().map((file) => `\`${file}\``))),
    section(
      "Recommended First Prompt",
      [
        "You are continuing work on the MLKD Research Platform Prototype.",
        "Use the repository patterns already present in Next.js App Router, Prisma, server actions, and admin forms.",
        "Before editing, inspect the relevant files listed in this handoff.",
        "Keep commit messages in English using Conventional Commits.",
        "Run the relevant validation commands before finishing.",
      ].join("\n")
    ),
  ].join("\n");

  mkdirSync(join(process.cwd(), "docs", "context"), { recursive: true });
  writeFileSync(outputPath, content);
  console.log(`Context summary written to ${outputPath}`);
}

main();
