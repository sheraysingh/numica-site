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
  assert.match(page, /href="(?:\.\/|\/)privacy\//);
  assert.match(page, /not yet for sale or available in app stores/i);
  assert.match(page, /href="(?:\.\/|\/)delete-account\/"/);
  assert.match(page, /Ontario curriculum/);
  assert.match(page, /Grades 1–10/);
  assert.match(page, /Google or Apple/);
  assert.match(page, /four-digit parent PIN/);
  assert.match(page, /not affiliated with the Ontario Ministry of Education or any school board/);
  assert.match(page, /Built for Ontario math, Grades 1 to 10/);
  assert.match(page, /<strong>Ontario math<\/strong>/);
  assert.doesNotMatch(page, /\$\d|buy now|start your free trial/i);
  assert.doesNotMatch(page, /<form|<input|<script/i);
});

test("shows every grade's real practice depth without calling software tests questions", async () => {
  const page = await read('index.html');
  assert.equal((page.match(/class="grade-practice-card(?:\s|\")/g) ?? []).length, 10);
  assert.match(page, /See the practice depth in every grade\./);
  assert.match(page, /curriculum-linked topics/);
  assert.match(page, /authored question types/);
  assert.match(page, /available variations/);
  assert.match(page, /focused sets of 10/);
  assert.match(page, /Academic <span>MPM2D<\/span>/);
  assert.match(page, /Applied <span>MFM2P<\/span>/);
  assert.match(page, /src="\.\/assets\/practice-depth-infographic-v2\.png"/);
  assert.match(page, /Illustrated forest map showing a selected grade branching into curriculum topics/);
  assert.ok((await readFile(new URL('../assets/practice-depth-infographic-v2.png', import.meta.url))).length > 100_000);
  assert.doesNotMatch(page, /150,?000 questions/i);
});

test('site only references local assets and provides basic accessibility hooks', async () => {
  const home = await read('index.html');
  const stylesheet = await read('styles.css');
  assert.match(home, /src="(?:\.\/|\/)assets\/numica-guide\.png"/);
  assert.match(home, /alt="Numica, the friendly maths guide"/);
  assert.match(home, /<main id="main">/);
  assert.match(home, /Skip to content/);
  assert.match(stylesheet, /:focus-visible/);
  assert.match(stylesheet, /prefers-reduced-motion/);
  assert.match(home, /\/assets\/screenshots\/welcome\.webp/);
  assert.match(home, /\/assets\/screenshots\/journey\.webp/);
  assert.match(home, /\/assets\/screenshots\/practice\.webp/);
  for (const screenshot of ['sign-in', 'camp', 'profile', 'parent-overview', 'settings', 'progress-report']) {
    assert.match(home, new RegExp(`/assets/screenshots/${screenshot}\\.webp`));
    assert.ok((await readFile(new URL(`../assets/screenshots/${screenshot}.webp`, import.meta.url))).length > 20_000);
  }
  assert.equal((home.match(/class="phone-frame"/g) ?? []).length, 9);
  assert.match(home, /The parent view/);
  assert.match(home, /privacy-safe demo month shows questions, accuracy, time, active days, and honest streaks/i);
  assert.match(home, /real Numica screens from recent development builds/);
  assert.doesNotMatch(home, /\bbeaver\b/i);
});

test('pages load no third-party assets', async () => {
  for (const file of ['index.html', 'privacy/index.html', 'delete-account/index.html', '404.html']) {
    const page = await read(file);
    assert.doesNotMatch(page, /<(?:img|script|link)[^>]+(?:src|href)=["']https?:/i);
    assert.doesNotMatch(page, /gtag\(|google-analytics|googletagmanager/i);
  }
});

test('account deletion page satisfies the public request route', async () => {
  const page = await read('delete-account/index.html');
  assert.match(page, /Delete account and all data/);
  assert.match(page, /Delete everything/);
  assert.match(page, /mailto:sheray@gmail\.com\?subject=Delete%20my%20Numica%20account/);
  assert.match(page, /verify that you own the account/i);
  assert.match(page, /within 30 days/i);
  assert.match(page, /parent account email and parent PIN hash/i);
  assert.match(page, /child’s first name and grade/i);
  assert.match(page, /practice sessions, answers, topic progress, and mastery records/i);
  assert.match(page, /does not delete your separate Google or Apple account/i);
});

test('privacy page explains GitHub Pages hosting', async () => {
  const page = await read('privacy/index.html');
  assert.match(page, /GitHub Pages/);
  assert.match(page, /IP address/);
  assert.match(page, /Google or Apple/);
  assert.match(page, /encrypted HTTPS connections/);
  assert.match(page, /access controls restrict each signed-in parent account to its own\s+family records/);
  assert.match(page, /does not store Google or Apple passwords/);
  assert.match(page, /does not currently offer purchases or subscriptions/);
  assert.match(page, /Delete account/);
  assert.match(page, /13 September 2026/);
});
