import {spawn} from 'node:child_process';
export class LocalAdapter {
 constructor(){this.runs=new Map();}
 start(spec){return new Promise((resolve,reject)=>{const child=spawn(spec.command,spec.args??[],{stdio:['ignore','pipe','pipe']});const run={id:crypto.randomUUID(),child,state:'running',out:'',err:''};this.runs.set(run.id,run);child.stdout.on('data',d=>run.out+=d);child.stderr.on('data',d=>run.err+=d);child.on('close',code=>{run.state=code===0?'completed':'failed';run.code=code;});resolve({id:run.id});});}
 async status(id){const r=this.runs.get(id);if(!r)throw new Error('unknown-run');return {state:r.state};}
 async result(id){const r=this.runs.get(id);if(!r)throw new Error('unknown-run');return {output:r.out,error:r.err,code:r.code};}
 async cancel(id){const r=this.runs.get(id);if(!r)return {supported:false};r.child.kill('SIGTERM');return {supported:true};}
}
export class FakeAdapter extends LocalAdapter {constructor(capabilities={cancel:true}){super();this.capabilities=capabilities;}async cancel(id){if(!this.capabilities.cancel)return {supported:false};return super.cancel(id);}}
export function conform(adapter){return ['start','status','result','cancel'].filter(name=>typeof adapter[name]!=='function');}
