// Test only against a disposable copy; never writes the site's shared library.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn,execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../../..'),php=process.env.PHP_BIN||path.join(root,'runtime/php/php.exe');
(async()=>{const temp=fs.mkdtempSync(path.join(os.tmpdir(),'circuitlab-ino-')),api=path.join(temp,'simuladores/falstad-web');fs.mkdirSync(api,{recursive:true});fs.mkdirSync(path.join(temp,'config'));
 fs.copyFileSync(path.join(root,'simuladores/falstad-web/library-api.php'),path.join(api,'library-api.php'));
 const hash=execFileSync(php,['-r','echo password_hash("isolated-test", PASSWORD_DEFAULT);'],{encoding:'utf8'});fs.writeFileSync(path.join(temp,'config/command-library.php'),`<?php return ['password_hash'=>'${hash}'];`);
 const server=spawn(php,['-S','127.0.0.1:8035','-t',temp],{stdio:'ignore',windowsHide:true});
 try{const url='http://127.0.0.1:8035/simuladores/falstad-web/library-api.php';let response;
 for(let i=0;i<40;i++){try{response=await fetch(url);break;}catch{await new Promise(r=>setTimeout(r,100));}}
 assert.ok(response,'server starts');let cookie=response.headers.get('set-cookie').split(';')[0];const initial=await response.json();
 const post=async data=>{const r=await fetch(url,{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':initial.csrf},body:JSON.stringify(data)});const c=r.headers.get('set-cookie');if(c)cookie=c.split(';')[0];return r;};
 const project={format:'falstad-mega',version:1,circuit:'$ 1 0.000005 10 50 5 50\nr 0 0 80 0 0 1000\n',mega:{hex:'',name:'',manual:{22:2},source:'void setup(){}\nvoid loop(){}',inoName:'aula.ino',compiledSource:null}};
 assert.equal((await post({action:'save',name:'Draft',category:'Mega',project})).status,403);
 assert.equal((await post({action:'login',password:'isolated-test'})).status,200);
 response=await post({action:'save',name:'Draft',category:'Mega',project});const saved=await response.json();assert.equal(response.status,200,JSON.stringify(saved));assert.deepEqual(saved.items[0].project.mega,project.mega);
 const publicData=await(await fetch(url)).json();assert.equal(publicData.admin,false);assert.equal(publicData.items[0].project.mega.source,project.mega.source);
 project.mega.hex=':00000001FF';project.mega.compiledSource=project.mega.source;
 response=await post({action:'save',name:'Compiled',category:'Mega',project});const compiled=await response.json();assert.equal(response.status,200);assert.equal(compiled.items[1].project.mega.compiledSource,project.mega.source);
 project.mega.source={bad:true};assert.equal((await post({action:'save',name:'Invalid',category:'Mega',project})).status,400);
 console.log('PASS: draft and compiled .ino preserved in protected shared examples; anonymous writes rejected');
 }finally{server.kill();await new Promise(r=>server.once('exit',r));if(path.dirname(temp)===fs.realpathSync(os.tmpdir())&&path.basename(temp).startsWith('circuitlab-ino-'))fs.rmSync(temp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1);});

