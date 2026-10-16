const fs=require('fs'),path=require('path');
const REPO='https://github.com/Snlex/nexumons-launcher/releases/download/';
const SERVERS=Object.freeze([
 Object.freeze({id:'nexumons',name:'Nexumons',subtitle:'Survie & aventure Cobblemon',description:'Explore les mondes, construis ta base et fais progresser ton équipe.',manifest:'https://raw.githubusercontent.com/Snlex/nexumons-launcher/main/kinetic1/academy/manifest.json',channel:'nexumons-academy',engineVersion:'1.0.0',userData:'Nexumons Academy',website:'https://nexumon.com',address:'172.255.205.132:25565'}),
 Object.freeze({id:'cobbloria',name:'Cobbloria',subtitle:'Skyblock & progression',description:'Développe ton île, complète tes quêtes et pars en expédition.',manifest:'https://raw.githubusercontent.com/Snlex/nexumons-launcher/main/skyblock/manifest.json',channel:'skyblock',engineVersion:'0.1.0',userData:'Cobbloria',website:'https://cobbloria.com',address:'172.241.3.147:25585'})
]);
function server(id){const s=SERVERS.find(s=>s.id===id);if(!s)throw Error('Serveur inconnu');return s;}
function channel(id,m){const s=server(id);if(!m||m.channel!==s.channel||m.engineVersion!==s.engineVersion||m.minecraft!=='1.21.1'||(m.java!=null&&m.java!==21)||!/^\d+\.\d+\.\d+$/.test(m.appVersion)||!/^[a-f0-9]{64}$/.test(m.appSha256)||typeof m.appUrl!=='string'||!m.appUrl.startsWith(REPO)||!m.appUrl.endsWith('.zip')||!/^[-.a-zA-Z0-9]+:\d+$/.test(m.serverAddress))throw Error('Mise à jour incompatible pour '+s.name);return m;}
function engineRoot(root,id){server(id);return path.join(root,'engines',id);}
function compare(a,b){const aa=String(a).split('.').map(Number),bb=String(b).split('.').map(Number);for(let i=0;i<3;i++)if(aa[i]!==bb[i])return aa[i]-bb[i];return 0;}
module.exports={SERVERS,server,channel,engineRoot,compare};
