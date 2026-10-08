const test=require('node:test');const assert=require('node:assert/strict');const fs=require('fs');const os=require('os');const path=require('path');const {applyClientDefaults}=require('../electron/defaults');
test('active les packs et les Pokémon sans effacer les préférences',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'nexu-defaults-'));try{
  fs.mkdirSync(path.join(root,'resourcepacks'));for(const name of ['Nexumons-Astral.zip','AZOTH_Xaeros_Icons_1.8.zip'])fs.writeFileSync(path.join(root,'resourcepacks',name),'test');
  fs.mkdirSync(path.join(root,'defaults'));fs.writeFileSync(path.join(root,'defaults','xaero-radar.json'),JSON.stringify({includeList:[],settingOverrides:{icons:1}}));
  fs.writeFileSync(path.join(root,'options.txt'),'fov:0.4\nresourcePacks:["vanilla","file/personal.zip"]\n');
  const radar=path.join(root,'config','xaero','minimap','profiles','entity_radar_categories','default.cfg.json');fs.mkdirSync(path.dirname(radar),{recursive:true});fs.writeFileSync(radar,JSON.stringify({name:'custom',includeList:['minecraft:villager'],settingOverrides:{icons:0,dotSize:7}}));
  applyClientDefaults(root);applyClientDefaults(root);
  const settings=JSON.parse(fs.readFileSync(radar));assert.equal(settings.name,'custom');assert.equal(settings.settingOverrides.dotSize,7);assert.equal(settings.settingOverrides.icons,2);assert.equal(settings.settingOverrides.displayed,true);assert.deepEqual(settings.includeList,['minecraft:villager','cobblemon:pokemon']);
  const options=fs.readFileSync(path.join(root,'options.txt'),'utf8');assert.match(options,/fov:0.4/);const packs=JSON.parse(options.match(/^resourcePacks:(.*)$/m)[1]);assert.equal(packs.length,4);assert.ok(packs.includes('file/personal.zip'));assert.ok(packs.includes('file/AZOTH_Xaeros_Icons_1.8.zip'));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
