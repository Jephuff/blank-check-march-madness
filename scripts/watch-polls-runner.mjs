import { execFileSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

export function summarizeScriptRun(result) {
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  return {
    ok: result.status === 0,
    blockedByMatchFailure:
      /✗ No match in .* for: /u.test(output) ||
      /✗ No unpolled matchup found for Day /u.test(output),
  };
}

export function runScript(name, ...args) {
  try {
    const stdout = execFileSync(
      process.execPath,
      [join(__dirname, name), ...args],
      {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    process.stdout.write(stdout);
    return summarizeScriptRun({ status: 0, stdout, stderr: '' });
  } catch (error) {
    const stdout = error.stdout?.toString?.() ?? '';
    const stderr = error.stderr?.toString?.() ?? '';
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    return summarizeScriptRun({
      status: typeof error.status === 'number' ? error.status : 1,
      stdout,
      stderr,
    });
  }
}
