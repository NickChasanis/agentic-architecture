// Supply checks from one evaluated revision. Keep previous attempts separately.
export function measure(e){
 const required=new Set(e.required);
 const checks=e.checks??[];
 const passed=new Set(checks.filter(c=>c.outcome==='pass').map(c=>c.obligation));
 const failed=checks.some(c=>required.has(c.obligation)&&c.outcome!=='pass');
 const coverage=required.size?[...required].filter(x=>passed.has(x)).length/required.size:null;
 const outside=(e.changedPaths??[]).filter(p=>!(e.declaredPaths??[]).some(root=>p===root||p.startsWith(root.replace(/\/$/,'')+'/'))).length;
 return {coverage,conformance:coverage===null?'not-measured':coverage===1&&!failed?'pass':'fail',outsideBoundary:outside,breakingChanges:e.breakingChanges,cost:e.cost==null?'unavailable':e.cost,minutes:e.minutes};
}
