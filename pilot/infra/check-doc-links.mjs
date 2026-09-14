import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const root=execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const files=execFileSync('git',['-C',root,'ls-files','-z','--','*.md'],{encoding:'utf8'}).split('\0').filter(Boolean);
let failures=0;
for(const file of files) {
  const text=readFileSync(resolve(root,file),'utf8');
  for(const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    let target=match[1].trim();
    if(/^(https?:|mailto:|#)/.test(target))continue;
    if(target.startsWith('<'))target=target.slice(1,target.indexOf('>'));
    target=target.split('#')[0];
    if(target && !existsSync(resolve(root,dirname(file),decodeURIComponent(target)))) {
      console.error(file+': '+target);failures++;
    }
  }
}
console.log('Tracked Markdown local links: '+files.length+' files, '+failures+' failures.');
process.exitCode=failures?1:0;
