const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os');const {validateIndex,commitPack}=require('../electron/pack');const {checkedRelative}=require('../electron/updates');const index=require('../electron/client-index.json');
test('Tous les téléchargements officiels sont épinglés',()=>{validateIndex(index);assert.equal(index.files.length,index.fileCount);assert(index.files.every(f=>f.sha256.length===64));assert(!index.files.some(f=>f.modId==='c2me'));assert(index.disabledFiles.some(f=>f.modId==='c2me')); });
test('Un chemin sortant du dossier du jeu est refusé',()=>{assert.throws(()=>checkedRelative('../settings.json'));assert.throws(()=>checkedRelative('/tmp/x'));const bad=structuredClone(index);bad.files[0].name='../escape.jar';assert.throws(()=>validateIndex(bad));});
test('Une installation préserve les mondes et garde les anciens mods en sauvegarde',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'society-pack-test-'));try{fs.mkdirSync(path.join(root,'mods'));fs.writeFileSync(path.join(root,'mods','old.jar'),'old');fs.mkdirSync(path.join(root,'saves'));fs.writeFileSync(path.join(root,'saves','world'),'untouched');const stage=path.join(root,'stage');fs.mkdirSync(path.join(stage,'mods'),{recursive:true});fs.writeFileSync(path.join(stage,'mods','new.jar'),'new');fs.writeFileSync(path.join(stage,'.academy-version'),'test');commitPack(root,stage);assert.equal(fs.readFileSync(path.join(root,'saves','world'),'utf8'),'untouched');assert.equal(fs.readFileSync(path.join(root,'.previous-pack','mods','old.jar'),'utf8'),'old');assert.equal(fs.readFileSync(path.join(root,'mods','new.jar'),'utf8'),'new');}finally{fs.rmSync(root,{recursive:true,force:true});}});
test('Le couple Sodium / More Culling distribué est celui dont les métadonnées Fabric ont été validées',()=>{const sodium=index.files.find(f=>f.modId==='sodium'),culling=index.files.find(f=>f.modId==='moreculling');assert.equal(sodium.modVersion,'0.6.13+mc1.21.1');assert.equal(culling.modVersion,'1.0.6');assert(!index.files.some(f=>f.name==='moreculling-fabric-1.21.1-1.0.11.jar'));});

test('Jade et EMI sont distribués sans deux overlays concurrents',()=>{assert(index.files.some(f=>f.modId==='jade'&&f.name==='Jade-1.21.1-Fabric-15.10.6.jar'));assert(index.files.some(f=>f.modId==='emi'&&f.name==='emi-1.1.24+1.21.1+fabric.jar'));assert(!index.files.some(f=>f.modId==='wthit'));});

test('Une mise à jour conserve les réglages personnels du suivi',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'nexumons-hud-'));try{fs.mkdirSync(path.join(root,'config'));fs.writeFileSync(path.join(root,'config','nexumons-journal.json'),'{"visible":false,"x":0.2}');const stage=path.join(root,'stage');fs.mkdirSync(path.join(stage,'config'),{recursive:true});fs.writeFileSync(path.join(stage,'.academy-version'),'test');commitPack(root,stage);assert.equal(JSON.parse(fs.readFileSync(path.join(root,'config','nexumons-journal.json'))).x,0.2);}finally{fs.rmSync(root,{recursive:true,force:true});}});

test('Les ajouts montures et combats conservent CCC 2.2 et refusent les configurations non prévues',()=>{
 validateIndex(index);assert(index.files.some(f=>f.modId==='cobblemon-battle-extras'&&f.modVersion==='1.13.45'));
 assert(index.files.some(f=>f.folder==='resourcepacks'&&f.name==='Nexumons-Journey-Mounts-1.7.2.zip'));
 assert(!index.files.some(f=>f.name.includes('CCC_1.9.2')));
 const duplicate=structuredClone(index);duplicate.files.push(duplicate.files[0]);duplicate.fileCount++;assert.throws(()=>validateIndex(duplicate));
 const bad=structuredClone(index);const config=bad.files.find(f=>f.folder==='config');assert(config);config.name='options.txt';assert.throws(()=>validateIndex(bad));
});


test('JourneyPAC complète la carte existante sans ajouter une seconde carte',()=>{
 const jp=index.files.find(f=>f.modId==='journeypac');assert(jp&&jp.modVersion==='1.1.7'&&jp.environment==='client');
 assert(index.files.some(f=>f.modId==='journeymap'));assert(index.files.some(f=>f.modId==='openpartiesandclaims'));
 assert(!index.files.some(f=>/xaero(minimap|worldmap)/i.test(f.modId||'')));
});
