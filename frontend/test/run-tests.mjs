import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function readProjectFile(...segments) {
  return readFile(path.join(projectRoot, ...segments), 'utf8');
}

async function run(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
    return true;
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    return false;
  }
}

async function main() {
  const results = await Promise.all([
    run('index.html mounts the app shell and loads app entry scripts', async () => {
      const html = await readProjectFile('index.html');

      assert.match(html, /<div id="root"><\/div>/);
      assert.match(html, /<script type="module" src="\/src\/main\.jsx"><\/script>/);
      assert.doesNotMatch(html, /text\/babel/);
    }),
    run('landing page still exposes the primary home actions', async () => {
      const landing = await readProjectFile('src', 'pages', 'landing-page.jsx');

      assert.match(landing, /Welcome to/);
      assert.match(landing, /Protect an Asset/);
      assert.match(landing, /Scan a URL/);
      assert.match(landing, /Help & FAQ/);
    }),
    run('migrated source structure exists for app code', async () => {
      const main = await readProjectFile('src', 'main.jsx');
      const api = await readProjectFile('src', 'services', 'api.js');
      const shell = await readProjectFile('src', 'components', 'shell.jsx');

      assert.match(main, /function App\(/);
      assert.match(main, /import '\.\/styles\/global\.css'/);
      assert.match(api, /const DEFAULT_BASE = import\.meta\.env\.DEV/);
      assert.match(api, /const BASE = import\.meta\.env\.VITE_API_BASE \|\| DEFAULT_BASE/);
      assert.match(shell, /export function Sidebar\(/);
    }),
  ]);

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\nFrontend tests: ${passed}/${total} passed`);

  if (passed !== total) {
    process.exitCode = 1;
  }
}

main();
