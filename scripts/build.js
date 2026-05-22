const { execSync } = require("child_process");

process.env.GENERATE_SOURCEMAP = "false";

const nodeOptions = [
  process.env.NODE_OPTIONS,
  "--max-old-space-size=448",
];

// Node 17+ needs this for Next.js 10 / webpack 4–5
if (Number(process.versions.node.split(".")[0]) >= 17) {
  nodeOptions.push("--openssl-legacy-provider");
}

process.env.NODE_OPTIONS = nodeOptions.filter(Boolean).join(" ");

execSync("npx next build", { stdio: "inherit", env: process.env });
