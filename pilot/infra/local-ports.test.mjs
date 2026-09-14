import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localPorts} from './local-ports.mjs';
test('local defaults and isolated overrides', () => {
  assert.deepEqual(localPorts(), {app:3443, identity:8443, database:55432});
  assert.deepEqual(localPorts({PILOT_APP_PORT:'3543',PILOT_IDENTITY_PORT:'8543',PILOT_DB_PORT:'56432'}), {app:3543, identity:8543, database:56432});
});
test('ports reject privileged, malformed, duplicate and out of range values', () => {
  for (const p of ['0','443','65536','12.5','01',' 3543','3543;echo x']) {
    assert.throws(() => localPorts({PILOT_APP_PORT:p}), /invalid-local-port/);
  }
  assert.throws(() => localPorts({PILOT_APP_PORT:'8443'}), /local-port-conflict/);
});
