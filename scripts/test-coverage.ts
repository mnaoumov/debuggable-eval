import { execFromRoot } from './helpers/root.ts';

const FULL_COVERAGE_IN_PERCENTS = 100;

async function main(): Promise<void> {
  const threshold = String(FULL_COVERAGE_IN_PERCENTS);
  await execFromRoot([
    'vitest',
    'run',
    '--coverage',
    `--coverage.thresholds.lines=${threshold}`,
    `--coverage.thresholds.functions=${threshold}`,
    `--coverage.thresholds.branches=${threshold}`,
    `--coverage.thresholds.statements=${threshold}`
  ]);
}

await main();
