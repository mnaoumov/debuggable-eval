/**
 * @file
 *
 * The release entry point: `npm run version '--' <type> [flags]`.
 *
 * The toolkit release runs the checks, bumps the version, writes the grouped `CHANGELOG.md` section from the
 * Conventional Commits since the last tag, commits, tags, pushes and creates the GitHub release with that section as
 * its body. The package itself reaches npm through `.github/workflows/publish-npm.yml`, which the published release
 * starts; this script then follows that run, so a failed publish fails the release too.
 */

import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import {
  execFromRoot,
  getRootFolder
} from '@mnaoumov/typescript-dev-toolkit/root';
import {
  parseVersionArguments,
  updateVersion
} from '@mnaoumov/typescript-dev-toolkit/version';
import { ensureNonNullable } from '@mnaoumov/typescript-lib/type-guards';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';

interface NpmPackResult {
  readonly filename: string;
}

interface PackageJsonVersion {
  readonly version?: string;
}

interface WorkflowRun {
  readonly databaseId: number;
  readonly headSha: string;
}

/*
The workflow that publishes to npm. Its filename is load-bearing twice over: npm's Trusted Publisher
configuration authorizes a run by this exact name, and this script polls for the run the release starts.
*/
const PUBLISH_WORKFLOW_FILE_NAME = 'publish-npm.yml';

/**
 * Packs the package into `dist` and returns the tarball, which the GitHub release carries as its asset.
 *
 * @returns The tarball path, relative to the repository root.
 */
async function getReleaseAssetPaths(): Promise<string[]> {
  const resultOutput = await execFromRoot(['npm', 'pack', '--pack-destination', 'dist', '--json'], { isQuiet: true });
  const [result] = JSON.parse(resultOutput) as [NpmPackResult];
  return [join('dist', result.filename)];
}

/**
 * Parses `gh run list --json`, treating unusable output as "no runs yet".
 *
 * `gh run list --workflow <file>` errors outright until GitHub has seen that workflow at least once, and the
 * first release after the publish workflow lands hits exactly that window. Keep polling instead of failing a
 * release that is otherwise complete.
 *
 * @param runListOutput - The output of `gh run list --json databaseId,headSha`.
 * @returns The runs, or an empty list.
 */
function parseWorkflowRuns(runListOutput: string): WorkflowRun[] {
  try {
    return JSON.parse(runListOutput) as WorkflowRun[];
  } catch {
    return [];
  }
}

/**
 * Reads the version the release just wrote into `package.json`.
 *
 * @returns The released version.
 */
async function readReleasedVersion(): Promise<string> {
  const rootFolder = ensureNonNullable(getRootFolder(), 'Could not determine the repository root');
  const packageJson = JSON.parse(await readFile(join(rootFolder, 'package.json'), 'utf-8')) as PackageJsonVersion;
  return ensureNonNullable(packageJson.version, 'package.json has no version');
}

/**
 * Resolves the id of the `publish-npm.yml` run started by the release that was just published, or `null`
 * when no run shows up in time.
 *
 * The run is matched by the commit the tag points at rather than by branch: a `release`-triggered run
 * reports the tag it came from, and a re-run of a failed publish keeps the same head SHA.
 *
 * @param newVersion - The released version, which is also its tag.
 * @returns The run id, or `null`.
 */
async function waitForPublishWorkflowRunId(newVersion: string): Promise<null | string> {
  const POLL_ATTEMPT_COUNT = 24;
  const POLL_INTERVAL_IN_MILLISECONDS = 5000;
  const RUN_LIST_LIMIT = '20';

  const commitSha = await execFromRoot(['git', 'rev-list', '-n', '1', newVersion], { isQuiet: true });

  for (let attempt = 0; attempt < POLL_ATTEMPT_COUNT; attempt++) {
    const runListOutput = await execFromRoot([
      'gh',
      'run',
      'list',
      '--workflow',
      PUBLISH_WORKFLOW_FILE_NAME,
      '--limit',
      RUN_LIST_LIMIT,
      '--json',
      'databaseId,headSha'
    ], {
      isQuiet: true,
      shouldIgnoreExitCode: true
    });

    const runs = parseWorkflowRuns(runListOutput);
    const run = runs.find((candidate) => candidate.headSha === commitSha);
    if (run) {
      return String(run.databaseId);
    }

    await sleep(POLL_INTERVAL_IN_MILLISECONDS);
  }

  return null;
}

/**
 * Follows the npm publish to completion so a failed publish fails this script too.
 *
 * npm mints its short-lived credential from the workflow's OIDC token, which only a supported CI runner can
 * produce, so there is nothing to publish with on this machine. Without this wait a broken publish would be
 * invisible and the release would look complete.
 *
 * @param newVersion - The released version, which is also its tag.
 */
async function watchNpmPublishWorkflow(newVersion: string): Promise<void> {
  const repoUrl = await execFromRoot('gh repo view --json url -q .url', { isQuiet: true });
  const runId = await waitForPublishWorkflowRunId(newVersion);

  if (!runId) {
    console.warn(
      `Could not find a ${PUBLISH_WORKFLOW_FILE_NAME} run for ${newVersion}. Check ${repoUrl}/actions/workflows/${PUBLISH_WORKFLOW_FILE_NAME} and start it manually if needed.`
    );
    return;
  }

  console.log(`Publishing to npm: ${repoUrl}/actions/runs/${runId}`);
  await execFromRoot(['gh', 'run', 'watch', runId, '--exit-status']);
}

await wrapCliTask(async () => {
  const [, , ...versionArguments] = process.argv;
  const { options, versionUpdateType } = parseVersionArguments(versionArguments);
  await updateVersion(versionUpdateType, {
    ...options,
    getReleaseAssetPaths
  });

  if (options.shouldDryRun || options.shouldRelease === false) {
    return;
  }

  await watchNpmPublishWorkflow(await readReleasedVersion());
});
