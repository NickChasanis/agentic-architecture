export function localPorts(env = {}) {
  const read = (key, fallback) => {
    const raw = env[key] ?? String(fallback);
    if (!/^[1-9][0-9]*$/.test(raw) || Number(raw) < 1024 || Number(raw) > 65535) {
      throw new Error('invalid-local-port: ' + key);
    }
    return Number(raw);
  };
  const ports = {
    app: read('PILOT_APP_PORT', 3443),
    identity: read('PILOT_IDENTITY_PORT', 8443),
    database: read('PILOT_DB_PORT', 55432),
  };
  if (new Set(Object.values(ports)).size !== 3) throw new Error('local-port-conflict');
  return ports;
}
