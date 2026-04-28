const assert = require('node:assert/strict');

const {
  assertSafePublicUrl,
  isPrivateAddress,
} = require('../src/modules/urlSafety');

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
    run('rejects unsupported protocols', async () => {
      await assert.rejects(
        assertSafePublicUrl('file:///etc/passwd'),
        /Only http and https URLs are allowed/
      );
    }),
    run('rejects localhost hostnames', async () => {
      await assert.rejects(
        assertSafePublicUrl('http://localhost:8080/image.png'),
        /hostname is not allowed/
      );
    }),
    run('rejects private metadata targets', async () => {
      await assert.rejects(
        assertSafePublicUrl('http://169.254.169.254/latest/meta-data'),
        /public IP address/
      );
    }),
    run('accepts public ip targets', async () => {
      const parsed = await assertSafePublicUrl('https://8.8.8.8/example.png');
      assert.equal(parsed.hostname, '8.8.8.8');
    }),
    run('classifies private address ranges correctly', async () => {
      assert.equal(isPrivateAddress('127.0.0.1'), true);
      assert.equal(isPrivateAddress('10.0.0.2'), true);
      assert.equal(isPrivateAddress('192.168.1.10'), true);
      assert.equal(isPrivateAddress('8.8.8.8'), false);
      assert.equal(isPrivateAddress('::1'), true);
    }),
  ]);

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\nBackend tests: ${passed}/${total} passed`);

  if (passed !== total) {
    process.exitCode = 1;
  }
}

main();
