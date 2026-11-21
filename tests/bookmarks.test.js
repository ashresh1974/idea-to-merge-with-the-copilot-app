import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatBookmark,
  loadBookmarks,
  normalizeUrl,
} from '../src/lib/bookmarks.js';

test('normalizes URLs with and without https to the same value', () => {
  assert.equal(normalizeUrl('https://www.example.com'), normalizeUrl('www.example.com'));
  assert.equal(normalizeUrl('www.example.com'), 'https://www.example.com/');
});

test('loading empty storage recovers an empty array', () => {
  assert.deepEqual(loadBookmarks(''), []);
});

test('loading corrupted storage recovers an empty array', () => {
  assert.deepEqual(loadBookmarks('{not json'), []);
});

test('loading legacy storage recovers an empty array', () => {
  assert.deepEqual(loadBookmarks('{"url":"https://example.com","slug":"mona-ab12"}'), []);
  assert.deepEqual(loadBookmarks('["https://example.com"]'), []);
});

test('loading non-array storage recovers an empty array', () => {
  assert.deepEqual(loadBookmarks('null'), []);
  assert.deepEqual(loadBookmarks('"https://example.com"'), []);
});

test('loading malformed array entries drops them and keeps valid bookmarks', () => {
  const raw = JSON.stringify([
    { url: 'https://example.com', slug: 'mona-ab12' },
    { url: 42, slug: 'mona-bad1' },
    { url: 'https://legacy.example', slug: 'legacy-slug' },
  ]);
  assert.deepEqual(loadBookmarks(raw), [
    { url: 'https://example.com', slug: 'mona-ab12' },
  ]);
});

test('formats a saved bookmark with the exact separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});
