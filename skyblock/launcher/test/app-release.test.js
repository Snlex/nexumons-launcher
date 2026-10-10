const test=require('node:test');const assert=require('node:assert/strict');const fs=require('fs');const os=require('os');const path=require('path');const crypto=require('crypto');const {syncArchive}=require('../electron/updates');
test('archive application publiée installe le nouveau moteur et Fabric 0.19.5',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'pokesky-app-'));const archive=path.resolve(__dirname,'../../downloads/PokeSky-app-0.2.5.zip');
 try{
  fs.mkdirSync(path.join(root,'electron'));fs.writeFileSync(path.join(root,'electron/main.js'),"const FABRIC_LOADER = '0.17.3';");
  const job=()=>syncArchive({root,url:'test',version:'0.2.5',sha256:crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'),dirs:['electron','build'],download:async(u,f)=>fs.copyFileSync(archive,f)});
  assert.equal(await job(),true);const source=fs.readFileSync(path.join(root,'electron/main.js'),'utf8');assert.match(source,/const FABRIC_LOADER = '0.19.5'/);assert.match(source,/channel.fabricLoader \|\| FABRIC_LOADER/);assert.equal(await job(),false);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
