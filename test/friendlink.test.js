const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeName, isValidFriendlinkUrl, normalizeUrl, hashUrl } = require('../src/utils/friendlink');
const { resolveSuggestion } = require('../src/services/friendlink.service');

test('accepts main domains and subdomains with an HTTPS root URL', () => {
  assert.equal(normalizeName('  示例站点  '), '示例站点');
  assert.equal(normalizeUrl('https://Example.COM/'), 'https://example.com/');
  assert.equal(normalizeUrl('https://blog.example.com/'), 'https://blog.example.com/');
  assert.equal(normalizeUrl('https://news.blog.example.co.uk/'), 'https://news.blog.example.co.uk/');
  assert.equal(hashUrl(normalizeUrl('https://EXAMPLE.COM/')), hashUrl(normalizeUrl('https://example.com/')));
});

test('rejects URLs outside the strict HTTPS root-domain format', () => {
  const invalidUrls = [
    'http://example.com/',
    'https://example.com',
    'https://example.com/path',
    'https://example.com/?page=1',
    'https://example.com/#about',
    'https://example.com:8443/',
    'https://user:pass@example.com/',
    'https://localhost/',
    'https://127.0.0.1/',
    'not-a-url'
  ];

  for (const url of invalidUrls) {
    assert.equal(isValidFriendlinkUrl(url), false, url);
    assert.throws(() => normalizeUrl(url), /必须为 https:\/\/主域名或二级域名\/ 格式/);
  }
});

test('accepts pass and review suggestions for pending friendlinks', () => {
  assert.equal(resolveSuggestion({ result: { suggestion: 'pass' } }), 'pass');
  assert.equal(resolveSuggestion({ result: { scenes: { antispam: { suggestion: 'review' } } } }), 'review');
});

test('rejects blocked, skipped, and unknown review results', () => {
  assert.throws(() => resolveSuggestion({
    result: {
      scenes: {
        antispam: {
          suggestion: 'block',
          details: [{ label: 'politician', score: 1 }]
        }
      }
    }
  }), { status: 403 });
  assert.throws(() => resolveSuggestion({ skipped: true }), { status: 502 });
  assert.throws(() => resolveSuggestion({ result: {} }), { status: 502 });
});
