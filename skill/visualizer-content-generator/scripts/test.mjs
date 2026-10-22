import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
for (const args of [
    [
        resolve(root, 'node_modules/vitest/vitest.mjs'),
        'run',
        'tests/content-brief.test.ts',
        'tests/content-media.test.ts',
    ],
    ['--test', 'tests/resource-library.test.mjs'],
]) {
    const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', windowsHide: true });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}
