import {readFile,writeFile} from 'node:fs/promises';
import pg from 'pg';
import {exportNamespace,restoreNamespace} from './backup.mjs';

const [mode,namespace,file]=process.argv.slice(2);
if(!['export','restore'].includes(mode)||!namespace||!file||process.argv.length!==5) {
  console.error('Usage: node contracts/coordination/backup-cli.mjs export SOURCE FILE | restore NEW_DESTINATION FILE');
  process.exitCode=1;
} else {
  let pool;
  try {
    const url=process.env.COORDINATION_DATABASE_URL || JSON.parse(await readFile(new URL('../../.local/config.json',import.meta.url),'utf8')).databaseUrl;
    pool=new pg.Pool({connectionString:url});
    if(mode==='export') {
      const backup=await exportNamespace(pool,namespace);
      await writeFile(file,JSON.stringify(backup,null,2)+'\n',{flag:'wx',mode:0o600});
      console.log(JSON.stringify({namespace,revision:backup.data.revision,sha256:backup.sha256}));
    } else {
      const result=await restoreNamespace(pool,JSON.parse(await readFile(file,'utf8')),namespace);
      console.log(JSON.stringify(result));
    }
  } catch {
    console.error('Backup operation failed. Check storage, schema, source/file, checksum and unused destination. No authority was transferred.');
    process.exitCode=1;
  } finally {if(pool)await pool.end();}
}
