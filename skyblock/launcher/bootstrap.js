const {app,BrowserWindow}=require('electron');const path=require('path');const fs=require('fs');const axios=require('axios');const Module=require('module');
const {syncArchive}=require('./electron/updates');
const MANIFEST='https://raw.githubusercontent.com/Snlex/nexumons-launcher/main/skyblock/manifest.json';
app.setName('Cobbloria');
const locked=app.requestSingleInstanceLock();if(!locked){app.quit();}else{
 app.whenReady().then(async()=>{
  if(process.env.NEXUMONS_PREVIEW==='1'&&!app.isPackaged){require('./electron/main');return;}
  const root=path.join(app.getPath('appData'),'nexumons-skyblock-launcher','application');
  if(process.platform==='darwin'&&app.dock)app.dock.setIcon(path.join(__dirname,'build','icon.png'));
  const status=new BrowserWindow({icon:path.join(__dirname,'build','icon.png'),width:520,height:240,resizable:false,backgroundColor:'#101323',webPreferences:{nodeIntegration:false,contextIsolation:true}});
  await status.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent('<body style="background:#101323;color:#e8eaff;font:18px sans-serif;padding:28px"><h2>Cobbloria</h2>Vérification des mises à jour GitHub…</body>'));
  try{
   const channel=(await axios.get(MANIFEST+'?t='+Date.now(),{timeout:15000})).data;
   if(channel.channel!=='skyblock'||channel.engineVersion!=='0.1.0')throw new Error('Nouvelle version du moteur : télécharge le launcher depuis la release Skyblock.');
   await syncArchive({root,url:channel.appUrl,version:channel.appVersion,sha256:channel.appSha256,dirs:['electron','build'],download:async(url,file)=>{
    const response=await axios.get(url,{responseType:'stream',timeout:120000});await require('stream/promises').pipeline(response.data,fs.createWriteStream(file));
   }});
  }catch(e){
   await status.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent('<body style="background:#101323;color:#e8eaff;font:16px sans-serif;padding:28px">GitHub indisponible ou mise à jour non installée.<br>Chargement de la dernière version locale.</body>'));
  }
  let entry=path.join(root,'electron','main.js');
  if(!fs.existsSync(entry))entry=path.join(__dirname,'electron','main.js');
  process.env.NODE_PATH=path.join(__dirname,'node_modules');Module._initPaths();
  try{require(entry);setImmediate(()=>status.close());}catch(e){require('electron').dialog.showErrorBox('Cobbloria','Impossible de charger le launcher : '+e.message);app.quit();}
 });
}
