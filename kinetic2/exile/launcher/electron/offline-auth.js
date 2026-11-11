const crypto=require('crypto');
function offlineAuth(input){const name=String(input||'').trim();if(!/^[A-Za-z0-9_]{3,16}$/.test(name))throw Error('Pseudo : 3 à 16 lettres, chiffres ou underscores.');const bytes=crypto.createHash('md5').update('OfflinePlayer:'+name,'utf8').digest();bytes[6]=(bytes[6]&15)|48;bytes[8]=(bytes[8]&63)|128;return {name,uuid:bytes.toString('hex'),access_token:crypto.randomBytes(16).toString('hex'),client_token:crypto.randomUUID(),user_properties:'{}',meta:{type:'legacy'},offline:true};}
module.exports={offlineAuth};
