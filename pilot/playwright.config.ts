import {defineConfig} from '@playwright/test';
import {readFileSync} from 'node:fs';
const local=JSON.parse(readFileSync('.local/config.json','utf8'));
export default defineConfig({
 testDir:'tests/e2e',workers:1,fullyParallel:false,timeout:60000,
 reporter:'list',use:{baseURL:local.origin,trace:'off',video:'off',screenshot:'off',
  launchOptions:{executablePath:process.env.PILOT_CHROME??'/usr/bin/google-chrome',
   args:['--ignore-certificate-errors-spki-list='+local.browserSpki]}},
 webServer:{command:'node --import tsx apps/api/server.ts',url:local.origin,
  ignoreHTTPSErrors:true, // Readiness probe only; browser trust is restricted to this generated SPKI.
  env:{NODE_EXTRA_CA_CERTS:'.local/tls.crt'},reuseExistingServer:false,timeout:30000},
});
