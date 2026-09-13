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
  assert.match(page, /href="\/privacy\//);
  assert.match(page, /Delete account and all data/);
  assert.match(page, /Ontario curriculum/);
  assert.match(page, /Grades 1–10/);
  assert.match(page, /Google or Apple/);
  assert.match(page, /four-digit parent PIN/);
  assert.match(page, /not affiliated with the Ontario Ministry of Education or any school board/);
  assert.doesNotMatch(page, /\$\d|buy now|start your free trial/i);
  assert.doesNotMatch(page, /<form|<input|<script/i);
});

test('site only references local assets and provides basic accessibility hooks', async () => {
  const home = await read('index.html');
  const stylesheet = await read('styles.css');
  assert.match(home, /src="\/assets\/numica-beaver\.png"/);
  assert.match(home, /alt="Numica, the friendly beaver guide"/);
  assert.match(home, /<main id="main">/);
  assert.match(home, /Skip to content/);
  assert.match(stylesheet, /:focus-visible/);
  assert.match(stylesheet, /prefers-reduced-motion/);
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
  assert.match(page, /Google or Apple/);
  assert.match(page, /does not currently offer purchases or subscriptions/);
  assert.match(page, /Delete account/);
  assert.match(page, /13 September 2026/);
});
