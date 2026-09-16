import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {openDatabase} from '../lib/sqlite.mjs';
import {authenticate} from '../lib/vps-auth.mjs';

test('SQLite migrations, durable writes, transaction rollback and optimistic concurrency',()=>{
 const dir=mkdtempSync(join(tmpdir(),'solaya-test-')), file=join(dir,'test.sqlite');
 let d=openDatabase(file);
 try {
  d.prepare('INSERT INTO content (key,value) VALUES (?,?)').bind('guides','[]').run();
  assert.throws(()=>d.batch([d.prepare('UPDATE content SET value=? WHERE key=?').bind('changed','guides'),d.prepare('INSERT INTO missing_table VALUES (1)')]));
  assert.equal(d.prepare('SELECT value FROM content WHERE key=?').bind('guides').first().value,'[]');
  d.prepare("INSERT INTO leads (id,request_key,name,email,city,postcode,segment,payload,source,due_at,created_at,updated_at) VALUES ('test','request','Test','test@example.invalid','Toulouse','31000','test','{}','test','2026-09-20','now','now')").run();
  const update=(version)=>d.batch([d.prepare("UPDATE leads SET version=version+1 WHERE id='test' AND version=?").bind(version),d.prepare("INSERT INTO history (id,lead_id,at,actor,description) SELECT ?, 'test','now','Test','update' WHERE changes()=1").bind('history-'+version)]);
  assert.equal(update(0)[0].meta.changes,1);
  assert.equal(update(0)[0].meta.changes,0);
  assert.equal(d.prepare('SELECT count(*) AS n FROM history').first().n,1);
  d.close(); d=openDatabase(file);
  assert.equal(d.prepare('SELECT value FROM content').first().value,'[]');
  assert.equal(d.prepare('SELECT count(*) AS n FROM _migrations').first().n,2);
 } finally {d.close();rmSync(dir,{recursive:true,force:true});}
});
test('preproduction authentication fails closed and validates password',()=>{
 process.env.PREPROD_ADMIN_EMAIL='test@example.invalid';
 delete process.env.PREPROD_PASSWORD_SHA256;
 const basic=s=>'Basic '+Buffer.from(s).toString('base64');
 assert.equal(authenticate(basic('kevin:test')),null);
 process.env.PREPROD_PASSWORD_SHA256=createHash('sha256').update('test').digest('hex');
 assert.equal(authenticate(null),null);
 assert.equal(authenticate('Basic garbage'),null);
 assert.equal(authenticate(basic('kevin:wrong')),null);
 assert.equal(authenticate(basic('adrien:test')),null);
 assert.equal(authenticate(basic('kevin:test')).email,'test@example.invalid');
});
