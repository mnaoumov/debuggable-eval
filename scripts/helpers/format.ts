import {
  execFromRoot,
  getRootFolder
} from '@mnaoumov/typescript-dev-toolkit/root';
import { assertNonNullable } from '@mnaoumov/typescript-lib/type-guards';
import { join } from 'node:path/posix';

interface FormatParams {
  paths?: string[] | undefined;
  rewrite?: boolean | undefined;
}

export async function format(params?: FormatParams): Promise<void> {
  const { paths, rewrite = true } = params ?? {};
  const rootFolder = getRootFolder();
  assertNonNullable(rootFolder, 'Root folder not found');

  const command = rewrite ? 'fmt' : 'check';
  const targets = paths?.length ? paths : ['**/*'];
  await execFromRoot(['npx', 'dprint', command, '--config', join(rootFolder, 'dprint.json'), { batchedArguments: targets }]);
}
