import {
  checkProjectTypes,
  parseTsConfig,
  toCanonical
} from '@mnaoumov/typescript-dev-toolkit/check-project-types';
import {
  execFromRoot,
  getRootFolder
} from '@mnaoumov/typescript-dev-toolkit/root';
import {
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync
} from 'node:fs';
import {
  readFile,
  writeFile
} from 'node:fs/promises';
import {
  dirname,
  join
} from 'node:path';

const ESM_DIR = 'dist/lib/esm';
const CJS_DIR = 'dist/lib/cjs';
const NODE_MODULES_SEGMENT = '/node_modules/';

function areProjectTypesValid(): boolean {
  const root = getRootFolder();

  if (!root) {
    throw new Error('Could not find root folder');
  }

  const rootCanonical = toCanonical(root);
  const { fileNames, options } = parseTsConfig(join(root, 'tsconfig.json'));

  return !options.skipLibCheck || checkProjectTypes({
    options,
    rootNames: fileNames,
    shouldKeepFile: (fileName) => shouldKeepProjectFile(fileName, rootCanonical)
  });
}

function collectFiles(dir: string, ext: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      result.push(...collectFiles(full, ext));
    } else if (full.endsWith(ext)) {
      result.push(full);
    }
  }
  return result;
}

async function main(): Promise<void> {
  await execFromRoot('tsc --project tsconfig.build.json');

  const dtsFiles = collectFiles(ESM_DIR, '.d.ts');

  for (const filePath of dtsFiles) {
    const normalized = toForwardSlash(filePath);
    const content = await readFile(filePath, 'utf8');

    const esmPath = normalized.replace(/\.d\.ts$/, '.d.mts');
    await writeFile(esmPath, rewriteImportExtensions(content, '.mjs'), 'utf8');

    const cjsPath = normalized.replace(ESM_DIR, CJS_DIR).replace(/\.d\.ts$/, '.d.cts');
    mkdirSync(dirname(cjsPath), { recursive: true });
    await writeFile(cjsPath, rewriteImportExtensions(content, '.cjs'), 'utf8');

    unlinkSync(filePath);
  }

  if (!areProjectTypesValid()) {
    throw new Error('TypeScript declaration validation failed.');
  }
}

function rewriteImportExtensions(content: string, targetExt: string): string {
  return content.replace(
    /(?<prefix>from\s+['"])(?<path>[^'"]*?)\.ts(?<quote>['"])/g,
    `$<prefix>$<path>${targetExt}$<quote>`
  );
}

function shouldKeepProjectFile(fileName: string, rootCanonical: string): boolean {
  return fileName.startsWith(`${rootCanonical}/`) && !fileName.includes(NODE_MODULES_SEGMENT);
}

function toForwardSlash(p: string): string {
  return p.replace(/\\/g, '/');
}

await main();
