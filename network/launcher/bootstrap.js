const {app,BrowserWindow,dialog}=require('electron');const path=require('path'),fs=require('fs'),Module=require('module'),crypto=require('crypto');const {checkedRelative}=require('./portal/updates');const {compare}=require('./portal/catalog');
process.env.NODE_PATH=path.join(__dirname,'node_modules');Module._initPaths();
const bundled=require('./package.json').version,root=path.join(app.getPath('appData'),'nexumons-network-launcher'),managed=path.join(root,'application');
function cached(file){try{const m=JSON.parse(fs.readFileSync(path.join(managed,'.managed-release.json'),'utf8'));if(!/^\d+\.\d+\.\d+$/.test(m.version)||compare(m.version,bundled)<0||!Object.keys(m.files||{}).length)return null;for(const [name,sha] of Object.entries(m.files)){checkedRelative(name);if(!/^(portal|build)\//.test(name)||crypto.createHash('sha256').update(fs.readFileSync(path.join(managed,name))).digest('hex')!==sha)return null;}const target=path.join(managed,'portal',file);return fs.existsSync(target)?target:null;}catch{return null;}}
const engineArg=process.argv.find(a=>a.startsWith('--network-engine='));
if(engineArg){require(cached('engine-host.js')||'./portal/engine-host').start(engineArg.split('=')[1]);}
else{
 app.setName('Nexumons Network');if(process.platform==='win32')app.setAppUserModelId('gg.nexumons.network.launcher');
 if(!app.requestSingleInstanceLock())app.quit();else app.whenReady().then(async()=>{
  const smoke=process.argv.includes('--smoke-test')||process.argv.some(a=>a.startsWith('--smoke-route='));let entry=smoke?path.join(__dirname,'portal/main.js'):cached('main.js')||path.join(__dirname,'portal/main.js'),loading;
  if(!smoke){loading=new BrowserWindow({width:460,height:220,resizable:false,backgroundColor:'#141b19',webPreferences:{nodeIntegration:false,contextIsolation:true}});await loading.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent('<body style="background:#141b19;color:#eee8d9;font:16px system-ui;padding:26px"><h2>Nexumons & Cobbloria</h2><p>Ouverture de tes univers…</p></body>'));
   try{const axios=require('axios'),{syncArchive}=require('./portal/updates'),{download}=require('./portal/download');const m=(await axios.get('https://raw.githubusercontent.com/Snlex/nexumons-launcher/main/network/manifest.json?t='+Date.now(),{timeout:4000})).data;let current=bundled;try{current=JSON.parse(fs.readFileSync(path.join(managed,'.managed-release.json'),'utf8')).version;}catch{}if(m.channel!=='network'||m.engineVersion!=='1.0.0'||!/^\d+\.\d+\.\d+$/.test(m.appVersion)||compare(m.appVersion,bundled)<0||compare(m.appVersion,current)<0||!String(m.appUrl).startsWith('https://github.com/Snlex/nexumons-launcher/releases/download/'))throw Error('Canal inconnu');await syncArchive({root:managed,url:m.appUrl,version:m.appVersion,sha256:m.appSha256,dirs:['portal','build'],download:(url,file)=>download(url,file,{sha256:m.appSha256})});entry=path.join(managed,'portal/main.js');}catch{}
  }
  try{require(entry).start({bundled:__dirname,root});if(loading)setImmediate(()=>loading.close());}catch{dialog.showErrorBox('Nexumons & Cobbloria','Impossible d’ouvrir le launcher. Réinstalle la dernière version.');app.quit();}
 });
}
