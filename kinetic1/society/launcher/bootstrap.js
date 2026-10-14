const {app,BrowserWindow,dialog}=require('electron');const path=require('path'),fs=require('fs'),axios=require('axios'),Module=require('module');const {syncArchive}=require('./electron/updates');const {PROFILE,acceptChannel}=require('./electron/profile');const bundled=require('./package.json').version;
app.setName('Nexumons Society');if(process.platform==='win32')app.setAppUserModelId('gg.nexumons.society.launcher');
function compare(a,b){const aa=String(a||'0').split('.').map(Number),bb=b.split('.').map(Number);for(let i=0;i<3;i++)if((aa[i]||0)!==(bb[i]||0))return (aa[i]||0)-(bb[i]||0);return 0;}
if(!app.requestSingleInstanceLock())app.quit();else app.whenReady().then(async()=>{
 if(process.platform==='darwin')app.dock?.setIcon(path.join(__dirname,'build/icon.png'));
 if(process.argv.includes('--smoke-test')){require('./electron/main');return;}
 const root=path.join(app.getPath('appData'),'nexumons-society-launcher','application');
 const loading=new BrowserWindow({width:480,height:230,resizable:false,backgroundColor:'#142c2a',icon:path.join(__dirname,'build/icon.png'),webPreferences:{nodeIntegration:false,contextIsolation:true}});
 await loading.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent('<body style="margin:0;background:#142c2a;color:#faf3e2;font:16px sans-serif;padding:32px"><h2>Nexumons Society</h2>Vérification des mises à jour…</body>'));
 try{const channel=acceptChannel((await axios.get(PROFILE.manifest+'?t='+Date.now(),{timeout:15000})).data);if(compare(channel.appVersion,bundled)<0)throw Error('Version distante plus ancienne');await syncArchive({root,url:channel.appUrl,version:channel.appVersion,sha256:channel.appSha256,dirs:['electron','build'],download:async(url,file)=>{const {download}=require('./electron/download');await download(url,file,{sha256:channel.appSha256});}});}catch(e){console.warn('Mise à jour non appliquée : '+e.message);}
 let entry=path.join(root,'electron/main.js'),cached;try{cached=JSON.parse(fs.readFileSync(path.join(root,'.managed-release.json'),'utf8'));}catch{}if(!fs.existsSync(entry)||compare(cached?.version,bundled)<0)entry=path.join(__dirname,'electron/main.js');
 process.env.NODE_PATH=path.join(__dirname,'node_modules');Module._initPaths();try{require(entry);setImmediate(()=>loading.close());}catch(e){dialog.showErrorBox('Nexumons Society',e.message);app.quit();}
}).catch(e=>{dialog.showErrorBox('Nexumons Society',e.message);app.quit();});
