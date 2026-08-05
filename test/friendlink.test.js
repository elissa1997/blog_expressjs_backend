const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeName, normalizeUrl, hashUrl } = require('../src/utils/friendlink');
const { resolveSuggestion } = require('../src/services/friendlink.service');

test('normalizes names and equivalent root URLs', () => {
  assert.equal(normalizeName('  示例站点  '), '示例站点');
  assert.equal(normalizeUrl('HTTPS://Example.COM:443#about'), 'https://example.com/');
  assert.equal(hashUrl(normalizeUrl('https://example.com')), hashUrl(normalizeUrl('HTTPS://EXAMPLE.COM:443#x')));
});

test('rejects unsafe or invalid URLs', () => {
  assert.throws(() => normalizeUrl('ftp://example.com'), /仅支持 http 或 https/);
  assert.throws(() => normalizeUrl('https://user:pass@example.com'), /格式不正确/);
  assert.throws(() => normalizeUrl('not-a-url'), /格式不正确/);
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
