'use strict';
const {randomBytes}=require('node:crypto');
function authError(error){
 const code=String(error?.code||error?.message||error||'');
 if(/AUTH_CANCELLED|error.gui.closed/.test(code))return 'Connexion Microsoft annulée. Tu peux réessayer.';
 if(/AUTH_TIMEOUT/.test(code))return 'La connexion Microsoft a pris trop de temps. Réessaie et termine la validation dans la fenêtre Microsoft.';
 if(/AUTH_STATE/.test(code))return 'Le retour Microsoft est invalide. Ferme la fenêtre et recommence la connexion.';
 if(/AUTH_NO_JAVA/.test(code))return 'Ce compte ne possède pas de profil Minecraft Java utilisable. Vérifie le compte Microsoft et sa licence Java.';
 if(/userNotFound/.test(code))return 'Crée d’abord ton profil Xbox sur xbox.com avec ce compte, puis réessaie.';
 if(/xsts.child/.test(code))return 'Les paramètres de famille Xbox de ce compte doivent être validés par son responsable.';
 if(/AUTH_NETWORK|ENOTFOUND|ECONNRESET|ETIMEDOUT|fetch failed/.test(code))return 'Impossible de joindre Microsoft ou Xbox. Vérifie ta connexion puis réessaie.';
 if(/AUTH_RELOGIN|invalid_grant|invalid_token/.test(code))return 'Ta session Microsoft a expiré. Reconnecte ton compte avant de jouer.';
 return 'La connexion Microsoft a échoué. Réessaie avec le compte qui possède Minecraft Java.';
}
function fail(code){const e=new Error(code);e.code=code;return e;}
function deadline(promise,ms=45000){let timer;return Promise.race([Promise.resolve(promise),new Promise((_,reject)=>{timer=setTimeout(()=>reject(fail('AUTH_NETWORK')),ms);})]).finally(()=>clearTimeout(timer));}
function tokenExpiry(auth){try{const jwt=JSON.parse(Buffer.from(String(auth.access_token).split('.')[1],'base64url').toString());if(Number.isFinite(jwt.exp))return jwt.exp*1000;}catch{}return Number(auth.meta?.exp)||0;}
function checkedAuthorization(minecraft){
 const value=minecraft.mclc();
 if(minecraft.isDemo?.()||value.meta?.demo||!/^[a-f0-9]{32}$/i.test(value.uuid||'')||!/^\w{3,16}$/.test(value.name||'')||!value.access_token)throw fail('AUTH_NO_JAVA');
 return value;
}
function popupCode({auth,BrowserWindow,parent,timeoutMs=180000}){
 return new Promise((resolve,reject)=>{
  const state=randomBytes(24).toString('hex');const target=new URL(auth.token.redirect);const link=new URL(auth.createLink());link.searchParams.set('state',state);
  const win=new BrowserWindow({parent:parent&&!parent.isDestroyed()?parent:undefined,title:'Connexion Microsoft · Nexumons',width:540,height:740,minWidth:460,minHeight:600,show:false,autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,partition:'nexumons-microsoft-'+randomBytes(12).toString('hex')}});
  let settled=false;const timer=setTimeout(()=>finish(fail('AUTH_TIMEOUT')),timeoutMs);
  function finish(error,code){if(settled)return;settled=true;clearTimeout(timer);if(!win.isDestroyed())win.close();if(error)reject(error);else resolve(code);}
  function capture(url,event){let u;try{u=new URL(url);}catch{return false;}
   if(u.origin!==target.origin||u.pathname!==target.pathname)return false;
   event?.preventDefault?.();
   if(u.searchParams.get('state')!==state){finish(fail('AUTH_STATE'));return true;}
   if(u.searchParams.has('error')){finish(fail(u.searchParams.get('error')==='access_denied'?'AUTH_CANCELLED':'AUTH_RELOGIN'));return true;}
   const code=u.searchParams.get('code');if(!code){finish(fail('AUTH_RELOGIN'));return true;}finish(null,code);return true;
  }
  win.on('closed',()=>{if(!settled)finish(fail('AUTH_CANCELLED'));});
  win.once('ready-to-show',()=>{if(!settled&&!win.isDestroyed()){win.show();win.focus();}});
  const wc=win.webContents;
  wc.on('will-redirect',(e,url,_inPlace,isMainFrame)=>{if(isMainFrame!==false)capture(url,e);});
  wc.on('will-navigate',(e,url)=>capture(url,e));
  wc.on('did-navigate',(_e,url)=>capture(url));
  wc.on('did-finish-load',()=>{if(!settled)capture(wc.getURL());});
  wc.on('did-fail-load',(_e,code,_description,url,isMainFrame)=>{if(settled||isMainFrame===false||code===-3)return;if(!capture(url))finish(fail('AUTH_NETWORK'));});
  wc.on('render-process-gone',()=>finish(fail('AUTH_NETWORK')));
  wc.setWindowOpenHandler(({url})=>{try{if(new URL(url).protocol==='https:')Promise.resolve(win.loadURL(url)).catch(()=>finish(fail('AUTH_NETWORK')));}catch{}return {action:'deny'};});
  Promise.resolve(win.loadURL(link.toString())).catch(()=>{if(!settled)finish(fail('AUTH_NETWORK'));});
 });
}
class MicrosoftSession {
 constructor({Auth,BrowserWindow,parent=()=>null,now=Date.now,popup=popupCode,requestTimeout=45000}){Object.assign(this,{Auth,BrowserWindow,parent,now,popup,requestTimeout});this.minecraft=null;this.pending=null;this.createdAt=0;}
 login(){if(this.pending)return this.pending;this.pending=this._login().finally(()=>{this.pending=null;});return this.pending;}
 async _login(){const auth=new this.Auth('select_account');const code=await this.popup({auth,BrowserWindow:this.BrowserWindow,parent:this.parent()});const xbox=await deadline(auth.login(code),this.requestTimeout);const minecraft=await deadline(xbox.getMinecraft(),this.requestTimeout);const account=checkedAuthorization(minecraft);this.minecraft=minecraft;this.createdAt=this.now();return account;}
 async authorization(){if(!this.minecraft)throw fail('AUTH_RELOGIN');let account=checkedAuthorization(this.minecraft);if(tokenExpiry(account)>this.now()+120000&&this.now()-this.createdAt<45*60000)return account;
  try{const refreshed=await deadline(this.minecraft.refresh(true),this.requestTimeout);account=checkedAuthorization(refreshed);if(tokenExpiry(account)<=this.now())throw fail('AUTH_RELOGIN');this.minecraft=refreshed;this.createdAt=this.now();return account;}catch(e){if(/AUTH_NETWORK|ENOTFOUND|ECONNRESET|ETIMEDOUT/.test(String(e?.code||e?.message||e)))throw fail('AUTH_NETWORK');this.clear();throw fail('AUTH_RELOGIN');}
 }
 clear(){this.minecraft=null;this.createdAt=0;}
}
module.exports={MicrosoftSession,popupCode,authError,tokenExpiry,checkedAuthorization,deadline};
