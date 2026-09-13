import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('custom domain is exact', async () => {
  assert.equal((await read('CNAME')).trim(), 'numica.dvi9.ca');
});

test('support page has working public details', async () => {
  const page = await read('index.html');
  assert.match(page, /mailto:sheray@gmail\.com/);
  assert.match(page, /https:\/\/numica\.dvi9\.ca\/privacy\//);
  assert.match(page, /Delete account and all data/);
  assert.doesNotMatch(page, /<form|<input|<script[^>]+src=/i);
});

test('pages load no third-party assets', async () => {
  for (const file of ['index.html', 'privacy/index.html', '404.html']) {
    const page = await read(file);
    assert.doesNotMatch(page, /<(?:img|script|link)[^>]+(?:src|href)=["']https?:/i);
    assert.doesNotMatch(page, /gtag\(|google-analytics|googletagmanager/i);
  }
});

test('privacy page explains GitHub Pages hosting', async () => {
  const page = await read('privacy/index.html');
  assert.match(page, /GitHub Pages/);
  assert.match(page, /IP address/);
  assert.match(page, /13 September 2026/);
});
