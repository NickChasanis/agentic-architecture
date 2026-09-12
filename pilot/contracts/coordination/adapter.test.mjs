import {test} from 'node:test';
import assert from 'node:assert/strict';
import {conform,LocalAdapter,FakeAdapter} from './adapter.mjs';
test('local and fake adapters expose the same lifecycle contract',async()=>{for(const adapter of [new LocalAdapter(),new FakeAdapter()]){const run=await adapter.start({command:'node',args:['-e','process.stdout.write("ok")']});for(let i=0;i<20&&(await adapter.status(run.id)).state==='running';i++)await new Promise(r=>setTimeout(r,10));assert.equal((await adapter.status(run.id)).state,'completed');assert.equal((await adapter.result(run.id)).output,'ok');assert.equal(conform(adapter).length,0);}});
test('unsupported cancellation is explicit',async()=>{const adapter=new FakeAdapter({cancel:false});const run=await adapter.start({command:'node',args:['-e','setTimeout(()=>{},1000)']});assert.equal((await adapter.cancel(run.id)).supported,false);});
