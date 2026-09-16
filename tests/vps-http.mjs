import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
const base=process.env.TEST_ORIGIN || 'http://localhost:3100';
const auth='Basic '+Buffer.from('kevin:'+process.env.TEST_PASSWORD).toString('base64');
async function req(path,method='GET',body,extra={}){
 return fetch(base+path,{method,headers:{Authorization:auth,Origin:base,'Content-Type':'application/json',...extra},body:body===undefined?undefined:JSON.stringify(body)});
}
const paths=['/','/collection','/agence','/contact','/proprietaires/airbnb','/proprietaires/longue-duree','/etude','/etude/confirmation','/guide-proprietaire','/confidentialite','/mentions-legales','/interne','/interne/funnel','/interne/lancement','/interne/logements','/pilotage','/pilotage/ressources','/bienvenue/demo-capitole','/bienvenue/demo-saint-cyprien','/documents/presentation.pdf','/documents/etude-airbnb.pdf','/documents/etude-longue-duree.pdf','/documents/proposition.pdf','/documents/modeles.json','/salon-solaya.png'];
const supports=JSON.parse(readFileSync(new URL('../lib/supports.json',import.meta.url)));
paths.push(...supports.map(s=>'/interne/supports/'+s.slug));
for(const path of paths){assert.equal((await fetch(base+path)).status,401,'anonymous '+path);assert.equal((await req(path)).status,200,path);}
assert.equal((await fetch(base+'/api/admin/leads',{headers:{'oai-authenticated-user-email':'kevindolie1@gmail.com','oai-authenticated-user-id':'forged'}})).status,401);
assert.equal((await req('/api/leads','POST',{}, {Origin:'https://other.invalid'})).status,403);
assert.equal((await req('/api/leads','POST',{})).status,400);
const p={requestKey:randomUUID(),name:'Test technique préprod',email:'test-'+randomUUID()+'@example.invalid',city:'Toulouse',postcode:'31000',segment:'airbnb',type:'appartement',bedrooms:2,availability:'3a6',timing:'maintenant',goal:'deleguer',contact:'email',marketing:false,acknowledge:true,website:'',source:'test-vps'};
let id;
try{
 const created=await req('/api/leads','POST',p);assert.equal(created.status,201);id=(await created.json()).reference;
 assert.equal((await (await req('/api/leads','POST',p)).json()).reference,id);
 const leads=await (await req('/api/admin/leads')).json();assert(leads.leads.some(l=>l.id===id));
 const edit={id,version:0,stage:'contacte',assignee:'Kevin',next_action:'Test',due_at:'2026-09-30',notes:'Donnée de test à supprimer',checks:{},stopped:false};
 assert.equal((await req('/api/admin/leads','PATCH',edit)).status,200);
 assert.equal((await req('/api/admin/leads','PATCH',edit)).status,409);
 assert.equal((await req('/api/admin/leads','PATCH',{...edit,version:1,stage:'actif'})).status,400);
 const history=await (await req('/api/admin/history?id='+id)).json();assert.equal(history.events.length,2);
 assert.equal((await req('/api/admin/guides')).status,200);
}finally{if(id)assert.equal((await req('/api/admin/leads','DELETE',{id,confirm:'EFFACER'})).status,200);}
console.log('PASS: pages/assets and all commercial supports, authentication, forged identity rejection, origin checks, intake, retry, CRM concurrency, stage rules, history and test cleanup.');
