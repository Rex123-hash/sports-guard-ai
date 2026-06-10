const assert = require('node:assert/strict');

const {
  assertSafePublicUrl,
  isPrivateAddress,
} = require('../src/modules/urlSafety');
const { finalConfidence, classify } = require('../src/modules/scoring');

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
    run('weights the adjudication score 0.4 hash + 0.6 gemini', async () => {
      assert.equal(finalConfidence(97, 96), 96);  // the guaranteed demo case
      assert.equal(finalConfidence(100, 100), 100);
      assert.equal(finalConfidence(0, 0), 0);
      assert.equal(finalConfidence(80, 90), 86);  // 32 + 54
    }),
    run('buckets verdicts at the documented thresholds', async () => {
      assert.equal(classify(85), 'piracy');
      assert.equal(classify(84), 'review');
      assert.equal(classify(70), 'review');
      assert.equal(classify(69), 'clean');
      assert.equal(classify(0), 'clean');
    }),
    run('hash similarity alone can never confirm piracy', async () => {
      // Gemini unavailable → confidence caps at 40, always below review.
      assert.equal(classify(finalConfidence(100, 0)), 'clean');
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
