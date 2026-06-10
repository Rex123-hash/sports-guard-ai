const { lookup } = require('node:dns').promises;
const net = require('node:net');

async function assertSafePublicUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs are allowed');
  }

  if (!parsed.hostname) {
    throw new Error('URL hostname is required');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Authenticated URLs are not allowed');
  }

  if (isBlockedHostname(parsed.hostname)) {
    throw new Error('URL hostname is not allowed');
  }

  const addresses = await resolveHost(parsed.hostname);
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new Error('URL must resolve to a public IP address');
  }

  return parsed;
}

function isBlockedHostname(hostname) {
  const normalized = hostname.trim().toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized.endsWith('.local')
  );
}

async function resolveHost(hostname) {
  if (net.isIP(hostname)) {
    return [hostname];
  }

  const results = await lookup(hostname, { all: true });
  return results.map((entry) => entry.address);
}

function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number);

    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }

  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return (
      normalized === '::1' ||
      normalized === '::' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      normalized.startsWith('fe80:') ||
      normalized.startsWith('::ffff:127.') ||
      normalized.startsWith('::ffff:10.') ||
      normalized.startsWith('::ffff:192.168.') ||
      normalized.startsWith('::ffff:169.254.')
    );
  }

  return true;
}

module.exports = {
  assertSafePublicUrl,
  isPrivateAddress,
};
