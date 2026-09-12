import path from 'node:path';
import fs from 'node:fs';
import ts from 'typescript';
import {pathToFileURL} from 'node:url';
export function allowedImport(file,specifier){
 const target=specifier.startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(file),specifier)):specifier;
 if(file.startsWith('modules/')){
  const root=file.split('/').slice(0,2).join('/')+'/';
  return target.startsWith(root)||specifier.startsWith('node:')||specifier==='pg';
 }
 if(file.startsWith('apps/merchant-admin/')){
  if(specifier.startsWith('.'))return target.startsWith('apps/merchant-admin/')||target.startsWith('contracts/');
  return specifier.startsWith('@angular/')||['rxjs','ajv','ajv-formats'].includes(specifier);
 }
 return true;
}
export function checkBoundaries(){
 const errors=[];
 function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const file=path.posix.join(dir,entry.name);
   if(entry.isDirectory())walk(file);
   else if(file.endsWith('.ts')){
    const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
    function visit(node){
     let spec;
     if(ts.isImportDeclaration(node)||ts.isExportDeclaration(node))spec=node.moduleSpecifier;
     if(ts.isCallExpression(node)&&(node.expression.kind===ts.SyntaxKind.ImportKeyword||node.expression.getText(source)==='require'))spec=node.arguments[0];
     if(spec&&(!ts.isStringLiteral(spec)||!allowedImport(file,spec.text)))errors.push(file+': forbidden import');
     ts.forEachChild(node,visit);
    }visit(source);
   }
  }
 }walk('modules');walk('apps');
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: module and merchant import boundaries.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)checkBoundaries();
