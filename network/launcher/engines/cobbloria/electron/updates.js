const fs=require('fs');const path=require('path');const crypto=require('crypto');
const extract=require('extract-zip');
async function hash(file){const h=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(file))h.update(chunk);return h.digest('hex');}
function checkedRelative(name){if(!name||name.includes('\\')||path.posix.isAbsolute(name)||name.split('/').some(x=>x==='..'||x==='.'))throw new Error('Chemin de mise à jour invalide');return name;}
async function validateTree(stage){
 const listing=JSON.parse(fs.readFileSync(path.join(stage,'files.json'),'utf8'));
 if(!listing.files||!Object.keys(listing.files).length)throw new Error('Archive vide');
 for(const [name,sha] of Object.entries(listing.files)){
  checkedRelative(name);const file=path.join(stage,name);
  if(!fs.existsSync(file)||await hash(file)!==sha)throw new Error('Fichier endommagé : '+name);
 }
 return listing;
}
async function syncArchive({root,url,version,sha256,dirs,optionalDirs=[],download}){
 if(!/^[a-zA-Z0-9._-]+$/.test(version)||!/^[a-f0-9]{64}$/i.test(sha256))throw new Error('Version ou empreinte invalide');
 fs.mkdirSync(root,{recursive:true});
 const marker=path.join(root,'.managed-release.json');
 let old;try{old=JSON.parse(fs.readFileSync(marker,'utf8'));}catch{}
 if(old?.version===version&&old?.sha256===sha256){
  try{for(const [name,sha] of Object.entries(old.files)){checkedRelative(name);if(await hash(path.join(root,name))!==sha)throw Error();}return false;}catch{}
 }
 const stage=path.join(root,'.stage-'+crypto.randomUUID());const archive=stage+'.zip';
 const previous=path.join(root,'.previous');
 fs.mkdirSync(stage);let changed=[];
 try{
  await download(url,archive);
  if(await hash(archive)!==sha256)throw new Error('Téléchargement corrompu : installation précédente conservée.');
  await extract(archive,{dir:stage});const listing=await validateTree(stage);
  for(const name of Object.keys(listing.files))if(![...dirs,...optionalDirs].some(d=>name.startsWith(d+'/')))throw new Error('Fichier hors des dossiers gérés');
  fs.rmSync(previous,{recursive:true,force:true});fs.mkdirSync(previous);
  for(const dir of [...dirs,...optionalDirs]){
   checkedRelative(dir);const target=path.join(root,dir),saved=path.join(previous,dir),incoming=path.join(stage,dir);
   if(!fs.existsSync(incoming)){if(optionalDirs.includes(dir))continue;throw new Error('Dossier absent : '+dir);}
   const had=fs.existsSync(target);if(had)fs.renameSync(target,saved);
   changed.push({target,saved,had});fs.renameSync(incoming,target);
  }
  const next=marker+'.new';fs.writeFileSync(next,JSON.stringify({version,sha256,files:listing.files},null,2));fs.renameSync(next,marker);
  return true;
 }catch(e){
  for(const c of changed.reverse()){fs.rmSync(c.target,{recursive:true,force:true});if(c.had)fs.renameSync(c.saved,c.target);}throw e;
 }finally{fs.rmSync(stage,{recursive:true,force:true});fs.rmSync(archive,{force:true});}
}
module.exports={hash,checkedRelative,validateTree,syncArchive};
