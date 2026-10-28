#!/usr/bin/env -S npx tsx
/**
 * scripts/run_pipeline.ts — runs the news pipeline once, then exits.
 *
 * Executes each stage (defined inline below) in order, stopping at the first
 * failure and validating each stage's outputs. Scheduling is done by GitHub
 * Actions (.github/workflows/cron-pipeline.yml), not by this script.
 *
 * Run:
 *   npx tsx scripts/run_pipeline.ts
 *   npx tsx scripts/run_pipeline.ts --week=2026-08-10
 *   npx tsx scripts/run_pipeline.ts --no-ocr
 */
import { spawnSync } from "node:child_process";
import * as path from "node:path";
import * as fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(ROOT);

// --- Parse args ---
function parseArgs(argv: string[]): string[] {
  const pipelineArgs: string[] = [];

  for (const a of argv) {
    if (a.startsWith("--week=") || a === "--no-ocr") {
      pipelineArgs.push(a);
    } else {
      console.error(`unknown arg: ${a}`);
      process.exit(2);
    }
  }
  return pipelineArgs;
}

// --- Pipeline orchestration (inline config, previously pipeline-orchestration.json) ---
interface PipelineStage {
  id: number;
  name: string;
  script: string;
  args: string[];
  outputs: Array<{ desc: string; path: string }>;
}

interface PipelineConfig {
  name: string;
  stages: PipelineStage[];
  env: { required: string[]; dotenv: string };
  args: Array<{
    name: string;
    flag: string;
    type: string;
    default?: boolean | string;
    stages: number[];
  }>;
}

const PIPELINE_CONFIG: PipelineConfig = {
  name: "news-pipeline",
  stages: [
    {
      id: 1,
      name: "crawling KHU notice board (collector + ocr-director)",
      script: "scripts/khu_crawler.ts",
      args: [],
      outputs: [
        { desc: "notice markdown", path: "_workspace/01_notice.md" },
        { desc: "scraping report", path: "_workspace/01_scraping_report.md" },
      ],
    },
    {
      id: 2,
      name: "writing radio news scenario (scenarist)",
      script: "scripts/scenarist.ts",
      args: [],
      outputs: [
        { desc: "news scenario", path: "_workspace/03_news_scenario.md" },
      ],
    },
    {
      id: 3,
      name: "synthesizing full news audio (news-builder)",
      script: "scripts/news_builder.ts",
      args: [],
      outputs: [
        { desc: "full news audio", path: "store/*_full_news.wav" },
      ],
    },
  ],
  env: {
    required: ["GEMINI_API_KEY"],
    dotenv: ".env",
  },
  args: [
    {
      name: "week",
      flag: "--week",
      type: "string",
      stages: [1],
    },
    {
      name: "ocr",
      flag: "--no-ocr",
      type: "boolean",
      default: true,
      stages: [1],
    },
  ],
};

// --- Fail helper ---
function fail(msg: string): never {
  console.log(`[${new Date().toISOString()}] PIPELINE FAILED: ${msg}`);
  process.exit(1);
}

// --- Stage runner ---
function runStage(stage: PipelineStage, stageArgs: string[]): void {
  console.log(`[${new Date().toISOString()}] STAGE ${stage.id}/3: ${stage.name}`);
  const script = path.join(ROOT, stage.script);
  const args = [...stage.args, ...stageArgs];
  const res = spawnSync("node", [script, ...args], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (res.error) fail(`could not run stage: ${res.error.message}`);
  if (res.status !== 0) fail(`stage exited with status ${res.status}`);
}

// --- Output validation ---
async function requireFile(desc: string, filePath: string): Promise<void> {
  // Handle glob patterns
  if (filePath.includes("*")) {
    const dir = path.dirname(filePath);
    const pattern = path.basename(filePath);
    const files = await fsp.readdir(dir).catch(() => [] as string[]);
    const globPattern = pattern.replace(/\*/g, "");
    const matches = files.filter((f) => f.includes(globPattern));
    if (matches.length === 0) fail(`no files matching ${desc} at ${filePath}`);
    const stat = await fsp.stat(path.join(dir, matches[0])).catch(() => null);
    if (!stat || stat.size === 0) fail(`${desc} is empty`);
    console.log(`[${new Date().toISOString()}] PASS: ${desc} (${matches[0]}, ${stat.size} bytes)`);
    return;
  }

  const stat = await fsp.stat(filePath).catch(() => null);
  if (!stat || stat.size === 0) fail(`${desc} missing or empty at ${filePath}`);
  console.log(`[${new Date().toISOString()}] PASS: ${desc} (${stat.size} bytes)`);
}

// --- Collect stage args from orchestration and CLI args ---
function collectStageArgs(
  stageId: number,
  config: PipelineConfig,
  cliArgs: string[]
): string[] {
  const args: string[] = [];
  const relevantArgDefs = config.args.filter((a) => a.stages.includes(stageId));

  for (const def of relevantArgDefs) {
    const cliArg = cliArgs.find(
      (a) =>
        a.startsWith(`${def.flag}=`) ||
        a === def.flag
    );

    if (cliArg) {
      if (def.type === "boolean") {
        args.push(def.flag);
      } else {
        args.push(cliArg);
      }
    }
  }

  return args;
}

// --- Execute pipeline from orchestration ---
async function executePipeline(cliArgs: string[]): Promise<void> {
  const config = PIPELINE_CONFIG;

  // Check env requirements
  for (const key of config.env.required) {
    if (!process.env[key]) {
      fail(`${key} is not set (expected in .env or environment)`);
    }
  }

  // Execute each stage
  for (const stage of config.stages) {
    const stageArgs = collectStageArgs(stage.id, config, cliArgs);
    runStage(stage, stageArgs);

    // Validate outputs
    for (const output of stage.outputs) {
      const outputPath = path.join(ROOT, output.path);
      await requireFile(output.desc, outputPath);
    }
  }

  console.log(`[${new Date().toISOString()}] PIPELINE COMPLETE`);
}

// --- Main ---
async function main(): Promise<void> {
  const pipelineArgs = parseArgs(process.argv.slice(2));
  console.log(`[${new Date().toISOString()}] RUN started`);
  await executePipeline(pipelineArgs);
  process.exit(0);
}

main().catch((err) => {
  console.log(`[${new Date().toISOString()}] FATAL: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
