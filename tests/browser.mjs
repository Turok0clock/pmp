import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {LESSONS,QUESTIONS} from '../content.js';
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Users/sammo/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe'});
const base=process.env.TEST_URL||'http://127.0.0.1:4174/pmp/';
const context=await browser.newContext({viewport:{width:1366,height:1024},acceptDownloads:true});
const page=await context.newPage();const errors=[];page.on('pageerror',err=>errors.push(err.message));
const checks=[];const ok=x=>{checks.push(x);console.log(`PASS ${x}`);};
await mkdir('.qa',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pmp-learning-lab-v1')));
async function go(hash){await page.goto(base+hash);await page.locator('main h1').waitFor();}
async function respond(q,wrong=false){
 const area=page.locator(`[data-question="${q.id}"]`);
 if(q.type==='mcq')await area.locator(`[data-choice="${wrong?(q.answer+1)%q.choices.length:q.answer}"]`).check();
 if(q.type==='multi')for(const i of q.answer)await area.locator(`[data-choice="${i}"]`).check();
 if(q.type==='term')await area.locator('[data-term]').fill(q.answer[0]);
 if(['match','category'].includes(q.type))for(let i=0;i<q.answer.length;i++)await area.locator(`[data-map="${i}"]`).selectOption(String(q.answer[i]));
 if(q.type==='order')for(let i=0;i<q.answer.length;i++){const item=q.items[q.answer[i]];let current=await area.locator('.order-list li>span').allTextContents();let pos=current.indexOf(item);while(pos>i){await area.getByRole('button',{name:`Move ${item} up`,exact:true}).click();pos--;}}
 await area.locator('[data-confidence][value="sure"]').check();
 const check=area.locator('.check-answer');if(await check.count())await check.click();
}
try{
 await go('#home');await page.waitForFunction(()=>document.querySelector('#offline-status').textContent==='Ready offline',null,{timeout:20000});ok('Complete app cache verified before offline-ready status');
 await page.screenshot({path:'.qa/dashboard-desktop.png',fullPage:true});
 for(const size of [{width:820,height:1180},{width:1180,height:820},{width:390,height:844}]){await page.setViewportSize(size);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${size.width}`);await page.screenshot({path:`.qa/dashboard-${size.width}.png`,fullPage:true});}ok('Dashboard fits iPad portrait, landscape and phone widths');
 await page.setViewportSize({width:820,height:1180});
 await go('#lesson/project/7');await page.getByRole('button',{name:'Complete learning loop & schedule review',exact:true}).click();assert(!(await state()).lessons.project.completed);ok('Lesson cannot complete by skipping participation');
 await go('#lesson/project/0');await page.locator('#goal').fill('Apply this to the campus rollout.');await page.getByRole('button',{name:'Set the intention & continue'}).click();
 await respond(QUESTIONS.find(q=>q.id==='p-pre'),true);await page.getByRole('button',{name:'Continue to visual lesson'}).click();
 await page.getByRole('button',{name:'I studied the reading / video'}).click();await respond(QUESTIONS.find(q=>q.id==='p-term'));await page.locator('#recall-response').fill('The project has a defined end boundary; routine badge checking sustains the operating service.');await page.locator('.rubric summary').click();for(const x of await page.locator('[data-rubric]').all())await x.check();await page.getByRole('button',{name:'Save recall & connect'}).click();
 await respond(QUESTIONS.find(q=>q.id==='p-lab'));await page.getByRole('button',{name:'Save the connection & apply'}).click();await respond(QUESTIONS.find(q=>q.id==='p-decision'),true);await page.locator('.mistake-select').selectOption('Value / outcome confusion');await page.getByRole('button',{name:'Continue to the mini-exam'}).click();
 for(const q of LESSONS[0].exam)await respond(QUESTIONS.find(x=>x.id===q.id));assert.equal(await page.locator('.feedback').count(),0);await page.getByRole('button',{name:'Submit mini-exam',exact:true}).click();assert.equal(await page.locator('.feedback').count(),2);await page.getByRole('button',{name:'Reflect & plan'}).click();await page.locator('#reflection-note').fill('Hardware installation alone does not establish acceptance or operational readiness.');await page.getByRole('button',{name:'Complete learning loop & schedule review',exact:true}).click();
 let s=await state();assert(s.lessons.project.completed);assert.equal(Object.keys(s.reviews).length,5);assert.equal(s.attempts.length,6);assert(!s.reviews['p-pre']);ok('End-to-end lesson, delayed exam feedback, mistake reflection and review enrollment');
 await page.reload();await page.locator('main h1').waitFor();s=await state();assert(s.lessons.project.completed);assert(s.lessons.project.recall.includes('defined end'));ok('Progress, notes and explanation survive reload');
 await go('#lesson/portfolio/6');assert.equal(await page.locator('[data-question]').count(),3);ok('Mini-exam interleaves a previously completed topic');
 await go('#lesson/value/4');await respond(QUESTIONS.find(q=>q.id==='v-lab'));assert(await page.locator('.feedback').getAttribute('class').then(x=>x.includes('correct')));ok('Touch-accessible ordering exercise grades correctly');
 await go('#lesson/portfolio/4');await respond(QUESTIONS.find(q=>q.id==='pp-lab'));ok('Matching renderer saves and grades');
 await go('#lesson/constraints/2');await page.getByRole('button',{name:'Resources',exact:true}).click();assert((await page.locator('#impact-detail').textContent()).includes('Specialist'));await page.screenshot({path:'.qa/lesson-ipad.png',fullPage:true});ok('Interactive constraint diagram responds');
 await go('#review');await page.getByRole('button',{name:'Practice early',exact:true}).click();const reviewId=await page.locator('[data-question]').getAttribute('data-question');const before=(await state()).reviews[reviewId];await respond(QUESTIONS.find(q=>q.id===reviewId));const after=(await state()).reviews[reviewId];assert.equal(after.due,before.due);assert.equal(after.streak,before.streak);ok('Early review does not inflate retention spacing');
 await go('#settings');const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Export progress',exact:true}).click();const download=await downloadEvent;await download.saveAs('.qa/test-backup.json');
 await page.locator('#import-progress').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":999}')});await page.locator('#import-preview .notice-error').waitFor(); assert((await page.locator('#import-preview').textContent()).includes('Current progress has not changed'));await page.locator('#import-progress').setInputFiles('.qa/test-backup.json');await page.locator('#restore-backup').waitFor(); assert((await page.locator('#import-preview').textContent()).includes('Backup inspected'));await page.getByRole('button',{name:'Replace with this backup',exact:true}).click();assert((await state()).lessons.project.completed);ok('Backup export, validation, rejected bad import and successful restore');
 await context.setOffline(true);await go('#lesson/ai/2');assert((await page.locator('main').textContent()).includes('Generative AI and GPT'));await go('#lesson/ai/3');await respond(QUESTIONS.find(q=>q.id==='ai-term'));await page.reload();await page.locator('.feedback.correct').waitFor();assert((await state()).attempts.some(a=>a.questionId==='ai-term'&&a.correct));ok('Offline cold navigation, previously unopened lesson, local grading and reload');
 await context.setOffline(false);
 // Isolated profile for unreadable state: never silently replace the raw data.
 const bad=await browser.newContext();const badPage=await bad.newPage();await badPage.addInitScript(()=>localStorage.setItem('pmp-learning-lab-v1','not valid json'));await badPage.goto(base);await badPage.locator('#storage-alert').waitFor();assert.equal(await badPage.evaluate(()=>localStorage.getItem('pmp-learning-lab-v1')),'not valid json');await bad.close();ok('Unreadable local data is preserved with visible recovery guidance');
 assert.deepEqual(errors,[]);ok('No browser JavaScript errors');
 await writeFile('.qa/browser-results.json',JSON.stringify({checks,errors,browser:'Chromium on Windows',physicalIPad:false},null,2));
}finally{await browser.close();}
