import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, mkdirSync, cpSync, rmSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, delimiter} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync, spawnSync} from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url));
const realNpm = execFileSync('which', ['npm'], {encoding: 'utf8'}).trim();
const original = readFileSync(new URL('./verify-all.mjs', import.meta.url), 'utf8');

function fixture(t, {fail = false, connected = false, mutate = source => source} = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'verify-fixture-'));
  t.after(() => rmSync(dir, {recursive: true, force: true}));
  for (const path of ['pilot/infra', 'pilot/.local', 'examples', 'bin']) mkdirSync(join(dir, path), {recursive: true});
  writeFileSync(join(dir, 'pilot/infra/verify-all.mjs'), mutate(original));
  writeFileSync(join(dir, 'pilot/infra/check-doc-links.mjs'), '');
  writeFileSync(join(dir, 'pilot/.local/config.json'), '{}');
  cpSync(join(root, 'pilot/package.json'), join(dir, 'pilot/package.json'));
  cpSync(join(root, 'examples/portable-context'), join(dir, 'examples/portable-context'), {recursive: true});
  if (fail) writeFileSync(join(dir, 'examples/portable-context/src/filter.mjs'), 'export function filterNotes() { throw new Error("portable fixture failure"); }');

  // Only unrelated tools are stand-ins. The real portable npm script, tests and
  // sources execute, as does the actual verifier's command loop and exit path.
  for (const command of ['python3', 'npx']) writeFileSync(join(dir, 'bin', command), `#!${process.execPath}\nprocess.exit(0);\n`, {mode: 0o700});
  writeFileSync(join(dir, 'bin/npm'), `#!${process.execPath}
const {spawnSync} = require('node:child_process');
const args = process.argv.slice(2);
console.log('STEP:' + args[1]);
if (args[1] === 'test:portable') {
  const result = spawnSync(${JSON.stringify(realNpm)}, args, {stdio: 'inherit'});
  process.exit(result.error ? 1 : (result.status ?? 1));
}
`, {mode: 0o700});
  const git = args => execFileSync('git', args, {cwd: dir, stdio: 'pipe', timeout: 10000});
  git(['init', '-q']);
  git(['add', '.']);
  git(['-c', 'user.name=Verifier fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgSign=false', '-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'fixture']);
  const env = {...process.env, PATH: join(dir, 'bin') + delimiter + process.env.PATH, npm_config_offline: 'true'};
  // This is a new verifier process, not a child test managed by this runner.
  // Inheriting child-v8 makes Node silently skip the nested --test invocation.
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, ['pilot/infra/verify-all.mjs', ...(connected ? ['--connected'] : [])], {
    cwd: dir, encoding: 'utf8', timeout: 30000,
    env,
  });
}

function success(result, connected) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /# tests 18/);
  assert.match(result.stdout, /EXT-002 selects exact active tags/);
  assert.match(result.stdout, /"outcome":"pass"/);
  const portable = result.stdout.indexOf('STEP:test:portable');
  const build = result.stdout.indexOf('STEP:build:merchant');
  assert.ok(portable >= 0 && build > portable, result.stdout);
  if (connected) assert.ok(result.stdout.indexOf('STEP:check:provider') > build);
  else assert.doesNotMatch(result.stdout, /STEP:check:provider/);
}

function failure(result) {
  assert.ifError(result.error);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /FAILED: npm run test:portable/);
  assert.match(result.stdout, /portable fixture failure/);
  assert.doesNotMatch(result.stdout, /STEP:build:merchant|STEP:check:provider|"outcome":"pass"/);
}

for (const connected of [false, true]) {
  const mode = connected ? 'connected' : 'offline';
  test(`${mode}: real portable checks run before later commands`, t => success(fixture(t, {connected}), connected));
  test(`${mode}: real portable failure prevents later commands`, t => failure(fixture(t, {fail: true, connected})));
}

test('oracle rejects a copied verifier that omits portable checks', t => {
  const result = fixture(t, {mutate: source => source.replace(" ['npm',['run','test:portable']],\n", '')});
  assert.throws(() => success(result, false), assert.AssertionError);
});

test('oracle rejects a copied verifier that continues after failure', t => {
  const result = fixture(t, {fail: true, mutate: source => source.replace('process.exit(result.status||1)', 'void 0')});
  assert.throws(() => failure(result), assert.AssertionError);
});
