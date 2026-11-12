import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {FOCUS_SESSIONS,FOCUS_QUESTIONS} from '../focus.js';
import {freshState,STORAGE_KEY} from '../engine.js';
const base=process.env.TEST_URL||'http://127.0.0.1:4174/pmp/';
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Users/sammo/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe'});
const context=await browser.newContext({viewport:{width:820,height:1180},acceptDownloads:true});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),STORAGE_KEY);
const go=async hash=>{await page.goto(base+hash);await page.locator('main h1').waitFor();};
async function respond(q,wrong=false){
 const el=page.locator(`[data-question="${q.id}"]`);
 if(q.type==='mcq')await el.locator(`[data-choice="${wrong?(q.answer+1)%q.choices.length:q.answer}"]`).check();
 if(q.type==='multi')for(const i of q.answer)await el.locator(`[data-choice="${i}"]`).check();
 if(['match','category'].includes(q.type))for(let i=0;i<q.answer.length;i++)await el.locator(`[data-map="${i}"]`).selectOption(String(q.answer[i]));
 if(q.type==='number')await el.locator('[data-number]').fill(wrong?'8000':q.answer.toLocaleString('en-US'));
 await el.locator('[data-confidence][value="sure"]').check();await el.locator('.check-answer').click();
}
try{
 await go('#home');await page.waitForFunction(()=>document.querySelector('#offline-status').textContent==='Ready offline');
 const old=freshState();delete old.focus;old.lessons.project={notes:'My original note remains',done:{},drafts:{},completed:false};
 await page.evaluate(({key,old})=>{localStorage.setItem(key,JSON.stringify(old));window.dispatchEvent(new StorageEvent('storage',{key}));},{key:STORAGE_KEY,old});
 await page.reload();await page.locator('main h1').waitFor();
 await go('#focus/state/6');await page.locator('[data-question="f-state-proposed"]').waitFor();
 await page.locator('#focus-next').click();assert.equal(await page.locator('[data-question]').getAttribute('data-question'),'f-state-proposed');
 console.log('PASS unanswered prompts cannot be bypassed by a deep link or Continue');
 for(const s of FOCUS_SESSIONS){
  await go(`#focus/${s.id}`);
  for(const size of [{width:820,height:1180},{width:1180,height:820},{width:390,height:844}]){await page.setViewportSize(size);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${s.id}: overflow at ${size.width}`);}
  await page.setViewportSize({width:820,height:1180});
  if(s.id==='state'){await page.locator('[data-state="2"]').click();assert((await page.locator('#state-detail').innerText()).includes('contain harm'));}
  if(s.id==='purpose'){await page.locator('[data-metric="delay"]').click();assert((await page.locator('#pareto-bars .focus-bar').first().innerText()).includes('Network faults'));await page.locator('[data-metric="count"]').click();assert((await page.locator('#pareto-bars .focus-bar').first().innerText()).includes('Lost passes'));}
  if(s.id==='value-math'){await page.locator('#evm-earned').fill('14');await page.locator('#evm-earned').dispatchEvent('input');assert((await page.locator('#evm-result').innerText()).includes('Cost equals earned value'));}
  await page.screenshot({path:`.qa/focus-${s.id}-ipad.png`,fullPage:true});
  await page.locator('#focus-start').click();
  for(const q of FOCUS_QUESTIONS.filter(q=>q.sessionId===s.id)){
   const wrong=['f-state-proposed','f-value-cv'].includes(q.id);await respond(q,wrong);
   assert.equal(await page.locator('.feedback.correct').count(),wrong?0:1,q.id);
   if(wrong){await page.locator('#focus-next').click();assert.equal(await page.locator('[data-question]').getAttribute('data-question'),q.id);await page.locator('.mistake-select').selectOption(q.type==='number'?'Calculation / units gap':'Heuristic treated as absolute');}
   if(q.cue)assert((await page.locator('.feedback').innerText()).includes('Decisive cue'));
   await page.locator('#focus-next').click();
  }
  await page.getByText('FIRST GUIDED PASS',{exact:true}).waitFor();
 }
 let s=await state();assert.equal(s.attempts.length,15);assert.equal(Object.keys(s.reviews).length,15);assert.equal(Object.keys(s.lessons).length,1);assert.equal(s.lessons.project.notes,'My original note remains');
 const miss=s.attempts.find(a=>a.questionId==='f-value-cv');assert(Math.abs(s.reviews[miss.questionId].due-(miss.at+600000))<1000);
 console.log('PASS all 3 sessions, numeric grading, mistake gates, independent progress, old-backup migration and review enrollment');
 await go('#focus');assert.equal(await page.locator('.mindset-card').count(),13);await page.locator('.mindset-card').first().locator('summary').click();await page.screenshot({path:'.qa/focus-path-ipad.png',fullPage:true});
 await go('#settings');const downloadPromise=page.waitForEvent('download');await page.locator('#export-progress').click();const download=await downloadPromise;await download.saveAs('.qa/focus-backup.json');await page.locator('#import-progress').setInputFiles('.qa/focus-backup.json');await page.locator('#restore-backup').click();assert.equal((await state()).attempts.length,15);
 await context.setOffline(true);await go('#focus/value-math');await page.locator('#evm-earned').fill('20');await page.locator('#evm-earned').dispatchEvent('input');assert((await page.locator('#evm-result').innerText()).includes('$6,000'));
 await go('#review');await page.getByRole('button',{name:'Practice early',exact:true}).click();const qid=await page.locator('[data-question]').getAttribute('data-question'),q=FOCUS_QUESTIONS.find(q=>q.id===qid),before=(await state()).reviews[qid];await respond(q);assert.equal((await state()).reviews[qid].due,before.due);
 await page.reload();assert.equal((await state()).attempts.length,16);
 console.log('PASS focus backup/restore, offline diagrams and mixed review, early spacing and persistence');
 await context.setOffline(false);await context.close();assert.deepEqual(errors,[]);
 console.log('PASS no browser errors; iPad portrait/landscape and phone layouts fit');
}finally{await browser.close();}
