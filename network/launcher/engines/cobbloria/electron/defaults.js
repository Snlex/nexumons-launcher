const fs=require('fs');const path=require('path');
function applyClientDefaults(gameDir){
 const options=path.join(gameDir,'options.txt');const text=fs.existsSync(options)?fs.readFileSync(options,'utf8'):'';
 const match=text.match(/^resourcePacks:(.*)$/m);let packs=['vanilla'];try{if(match)packs=JSON.parse(match[1]);}catch{}
 packs=packs.filter(x=>x!=='file/Nexumons-Astral-Pets.zip');
 for(const pack of ['Nexumons-Astral.zip','AZOTH_Xaeros_Icons_1.8.zip'])if(fs.existsSync(path.join(gameDir,'resourcepacks',pack))&&!packs.includes('file/'+pack))packs.push('file/'+pack);
 const line='resourcePacks:'+JSON.stringify(packs);fs.writeFileSync(options,match?text.replace(/^resourcePacks:.*$/m,line):text+'\n'+line+'\n');
 const template=path.join(gameDir,'defaults','xaero-radar.json');
 if(fs.existsSync(template)){
  const radar=path.join(gameDir,'config','xaero','minimap','profiles','entity_radar_categories','default.cfg.json');
  let settings=JSON.parse(fs.readFileSync(template,'utf8'));
  if(fs.existsSync(radar)){try{settings=JSON.parse(fs.readFileSync(radar,'utf8'));}catch{fs.copyFileSync(radar,radar+'.before-skyblock-update');}}
  settings.settingOverrides={...(settings.settingOverrides||{}),icons:2.0,displayed:true};
  settings.includeList=[...new Set([...(settings.includeList||[]),'cobblemon:pokemon'])];
  fs.mkdirSync(path.dirname(radar),{recursive:true});fs.writeFileSync(radar,JSON.stringify(settings,null,2));
 }
}
module.exports={applyClientDefaults};
