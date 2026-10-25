'use strict';
function clean(text){return String(text).replace(/Bearer\s+[^\s"']+/gi,'Bearer [MASQUÉ]').replace(/([?&](?:code|token|access_token|refresh_token|client_secret)=)[^&\s"']+/gi,'$1[MASQUÉ]').replace(/((?:access_token|refresh_token|client_token|client_secret|authorization)["']?\s*[:=]\s*["']?)[^\s,"'&}]+/gi,'$1[MASQUÉ]').slice(0,1500);}
function details(error){const seen=new Set();function walk(value,depth){if(depth>4||value==null)return '';if(typeof value==='string'||typeof value==='number')return String(value);if(typeof value!=='object'||seen.has(value))return '';seen.add(value);const parts=[];for(const key of ['message','errorMessage','error_description','description','reason','code','error','cause']){const v=walk(value[key],depth+1);if(v&&v!=='[object Object]'&&!parts.includes(v))parts.push(v);}const status=value.response?.status||value.statusCode||value.status;if(Number.isInteger(status))parts.push('HTTP '+status);return parts.join(' · ');}return clean(walk(error,0));}
function readableError(error){const text=details(error);
 if(/self.signed|CERT_|certificate|certificat/i.test(text))return 'Le certificat réseau est refusé. Vérifie la date Windows et les certificats de ton antivirus ou proxy ; aucun fichier non sécurisé ne sera installé.';
 if(/ENOSPC|No space left|Espace disque/i.test(text))return 'Espace disque insuffisant. Libère de la place puis réessaie.';
 if(/EACCES|EPERM|EBUSY/.test(text))return 'Un fichier du jeu est verrouillé ou son accès est refusé. Ferme Minecraft, puis relance le launcher. Détail : '+text;
 if(/ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|ERR_NETWORK|ECONNABORTED|socket hang up/i.test(text))return 'Connexion interrompue pendant la préparation. Réessaie ; si cela continue, ouvre Réglages → Journal de lancement. Détail : '+text;
 if(/HTTP (401|403)/.test(text))return 'Un téléchargement a été refusé par le service distant. Ouvre Réglages → Journal de lancement. Détail : '+text;
 return text||'Erreur de préparation sans détail fourni par le moteur. Ouvre Réglages → Journal de lancement et transmets le fichier au staff.';
}
module.exports={readableError,details,clean};
