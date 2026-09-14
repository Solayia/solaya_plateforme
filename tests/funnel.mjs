import {createRequire} from 'node:module';import {readFileSync,readdirSync} from 'node:fs';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const {Miniflare}=require('../node_modules/.pnpm/miniflare@4.20260515.0_@types+node@22.19.19/node_modules/miniflare');
const mf=new Miniflare({modules:readdirSync('dist/server',{recursive:true}).filter(x=>x.endsWith('.js')||x.endsWith('.mjs')).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:0).map(x=>({type:'ESModule',path:x,contents:readFileSync('dist/server/'+x,'utf8')})),modulesRoot:'.',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],assets:{directory:'dist/client',binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}},port:0});
try{const db=await mf.getD1Database('DB');const sql=readFileSync('drizzle/0000_strange_magneto.sql','utf8');for(const statement of sql.split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await db.prepare(statement).run();
await db.prepare(readFileSync('drizzle/0001_content.sql','utf8')).run();
const origin='http://localhost';const admin={'oai-authenticated-user-id':'local-test-owner','oai-authenticated-user-email':'kevindolie1@gmail.com'};const request=(path,method='GET',body,auth=false,extra={})=>mf.dispatchFetch(origin+path,{method,headers:{...(body?{'Content-Type':'application/json',Origin:origin}:{}),...(auth?admin:{}),...extra},...(body?{body:JSON.stringify(body)}:{})});
for(const path of ['/','/etude','/guide-proprietaire','/confidentialite','/proprietaires/airbnb','/proprietaires/longue-duree','/collection','/agence','/contact']){const r=await request(path);assert.equal(r.status,200,path);assert.ok((await r.text()).length>500)}
assert.equal((await request('/pilotage/ressources')).status,403);assert.equal((await request('/pilotage/ressources','GET',undefined,true)).status,200);assert.equal((await request('/api/admin/leads')).status,403);assert.equal((await request('/api/admin/history?id=x')).status,403);assert.equal((await request('/api/admin/leads','GET',undefined,false,{'oai-authenticated-user-id':'other','oai-authenticated-user-email':'other@example.test'})).status,403);
const payload={requestKey:crypto.randomUUID(),name:'Test propriétaire',email:'owner@example.test',phone:'',city:'Toulouse',postcode:'31000',segment:'deja',type:'appartement',bedrooms:2,availability:'6a12',timing:'maintenant',goal:'deleguer',listing:'',message:'Test local uniquement',contact:'email',preference:'',marketing:false,acknowledge:true,website:'',source:'test',campaign:'validation'};
assert.equal((await request('/api/leads','POST',payload,false,{Origin:'https://other.test'})).status,403);
assert.equal((await request('/api/leads','POST',{...payload,acknowledge:false})).status,400);
let r=await request('/api/leads','POST',payload);assert.equal(r.status,201);const created=await r.json();assert.ok(created.reference.startsWith('SC-'));
r=await request('/api/leads','POST',payload);assert.equal(r.status,200);assert.equal((await r.json()).reference,created.reference);
let list=await (await request('/api/admin/leads','GET',undefined,true)).json();assert.equal(list.leads.length,1);assert.equal(list.leads[0].marketing,0);assert.equal(list.leads[0].campaign,'validation');
const edit={id:created.reference,version:0,stage:'signe',assignee:'Kevin',next_action:'Vérifier le dossier',due_at:'2026-09-15',notes:'Test local',checks:{},stopped:false};
assert.equal((await request('/api/admin/leads','PATCH',edit,true)).status,400);
assert.equal((await request('/api/admin/leads','PATCH',{...edit,checks:{qualification:true,contract:true}},true)).status,200);
assert.equal((await request('/api/admin/leads','PATCH',{...edit,checks:{qualification:true,contract:true}},true)).status,409);
assert.equal((await request('/api/admin/leads','PATCH',{...edit,version:1,stage:'actif',checks:{qualification:true,contract:true}},true)).status,400);
assert.equal((await request('/api/admin/leads','PATCH',{...edit,version:1,stage:'pause',stopped:true},true)).status,200);
const events=await (await request('/api/admin/history?id='+created.reference,'GET',undefined,true)).json();assert.equal(events.events.length,3);
assert.equal((await request('/api/admin/leads','DELETE',{id:created.reference,confirm:'EFFACER'},true)).status,200);
assert.equal((await (await request('/api/admin/leads','GET',undefined,true)).json()).leads.length,0);
for(const segment of ['airbnb','longue-duree']){const r=await request('/api/leads','POST',{...payload,requestKey:crypto.randomUUID(),email:segment+'@example.test',segment});assert.equal(r.status,201);const rows=await db.prepare('SELECT segment FROM leads WHERE email = ?').bind(segment+'@example.test').first();assert.equal(rows.segment,segment)}
assert.equal((await request('/api/admin/guides')).status,403);
const guides=await (await request('/api/admin/guides','GET',undefined,true)).json();assert.equal(guides.length,2);
assert.equal((await request('/api/admin/guides','PUT',guides,true)).status,200);
assert.equal((await request('/interne/funnel','GET',undefined,true)).status,200);
const denied=await (await request('/interne/funnel')).text();assert.ok(!denied.includes('Les supports du parcours'));
console.log('PASS: pages, admin isolation, origin guard, validation, persistent intake, idempotency, attribution, contract gates, optimistic locking, stop-contact, history, deletion. Local ephemeral database only.');
}finally{await mf.dispose()}
