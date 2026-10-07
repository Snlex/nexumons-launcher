const test=require('node:test');const assert=require('node:assert/strict');const fs=require('fs');const os=require('os');const path=require('path');const crypto=require('crypto');const {syncArchive,checkedRelative}=require('../electron/updates');
test('un téléchargement corrompu conserve mods, sauvegardes et version',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'nexu-test-'));
 try{fs.mkdirSync(path.join(root,'mods'));fs.writeFileSync(path.join(root,'mods','old.jar'),'old');fs.mkdirSync(path.join(root,'saves'));fs.writeFileSync(path.join(root,'saves','world'),'world');
 await assert.rejects(syncArchive({root,url:'test',version:'2',sha256:'a'.repeat(64),dirs:['mods'],download:async(u,f)=>fs.writeFileSync(f,'bad')}),/corrompu/);
 assert.equal(fs.readFileSync(path.join(root,'mods','old.jar'),'utf8'),'old');assert.equal(fs.readFileSync(path.join(root,'saves','world'),'utf8'),'world');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('refuse les chemins hors du pack',()=>{for(const p of ['../account','/account','a/../../account','a\\account'])assert.throws(()=>checkedRelative(p));});
for (const fixture of ['good.zip','missing-dir.zip']) test(fixture==='good.zip'?'installe une version, retire les anciens mods et conserve les données personnelles':'restaure les mods après un échec pendant le remplacement',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'nexu-test-'));const archive=path.join(__dirname,'fixtures',fixture);
 try{fs.mkdirSync(path.join(root,'mods'));fs.writeFileSync(path.join(root,'mods','old.jar'),'old');fs.mkdirSync(path.join(root,'resourcepacks'));fs.writeFileSync(path.join(root,'resourcepacks','old.zip'),'old theme');fs.writeFileSync(path.join(root,'options.txt'),'my settings');
 const job=()=>syncArchive({root,url:'test',version:'2',sha256:crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'),dirs:['mods','resourcepacks'],download:async(u,f)=>fs.copyFileSync(archive,f)});
 if(fixture==='missing-dir.zip'){await assert.rejects(job(),/Dossier absent/);assert.equal(fs.readFileSync(path.join(root,'mods','old.jar'),'utf8'),'old');}
 else{assert.equal(await job(),true);assert.equal(fs.existsSync(path.join(root,'mods','old.jar')),false);assert.equal(await job(),false);fs.writeFileSync(path.join(root,'mods','new.jar'),'broken');assert.equal(await job(),true);assert.equal(fs.readFileSync(path.join(root,'mods','new.jar'),'utf8'),'new mod');}
 assert.equal(fs.readFileSync(path.join(root,'options.txt'),'utf8'),'my settings');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
