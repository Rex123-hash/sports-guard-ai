const { spawn } = require('node:child_process');
const path = require('node:path');

// Local dev sets PYTHON_BIN to the venv python; the container uses python3.
const PYTHON_BIN = process.env.PYTHON_BIN || 'python3';
const VIDEO_DIR = path.join(__dirname, '..', '..', 'video');
const TIMEOUT_MS = Number(process.env.VIDEO_TIMEOUT_MS || 180000);

/**
 * Runs the embedded Python video detector as a subprocess.
 * @param {string} source - video file path / direct URL / platform URL
 * @param {Array<{id,title,imageUrl}>} assets - registry passed via stdin
 * @returns {Promise<object>} parsed JSON from the CLI's stdout
 */
function runVideoDetection(source, assets = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON_BIN, ['detect_cli.py', '--source', source], { cwd: VIDEO_DIR });

    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error('video detection timed out'));
    }, TIMEOUT_MS);

    proc.stdout.on('data', (d) => { out += d; });
    proc.stderr.on('data', (d) => { err += d; });
    proc.on('error', (e) => { clearTimeout(timer); reject(e); });
    proc.on('close', () => {
      clearTimeout(timer);
      const line = out.trim().split('\n').filter(Boolean).pop();
      try {
        resolve(JSON.parse(line));
      } catch {
        reject(new Error('video CLI returned no JSON: ' + (err || out).slice(0, 300)));
      }
    });

    // Swallow EPIPE if the child exits before we finish writing the registry.
    proc.stdin.on('error', () => {});
    try {
      proc.stdin.write(JSON.stringify(assets));
      proc.stdin.end();
    } catch { /* child already gone; close/error handler will settle */ }
  });
}

module.exports = { runVideoDetection };
