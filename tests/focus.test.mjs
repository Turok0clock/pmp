import test from 'node:test';
import assert from 'node:assert/strict';
import {LESSONS,QUESTIONS,QUESTION_MAP,SOURCES} from '../content.js';
import {FOCUS_SESSIONS,FOCUS_QUESTIONS} from '../focus.js';
import {freshState,grade,answered,recordAttempt,scheduleReview,validateState,DAY} from '../engine.js';

test('numeric recall requires a number, honors signs and does not accept partial parses',()=>{
 const cv=QUESTION_MAP['f-value-cv'],ev=QUESTION_MAP['f-value-ev'];
 for(const v of ['-8000','-8,000','  -8000.00  '])assert(grade(cv,v).correct,v);
 assert(grade(ev,'96,000').correct);
 for(const v of ['',null,' ','-8,00','8000','-8000abc','$-8,000','Infinity','1e3','-8000+2'])assert(!grade(cv,v).correct,String(v));
 for(const v of ['',null,'-8,00','96,000x'])assert(!answered(ev,v),String(v));
 assert(answered(cv,'0'));assert(!grade(cv,'0').correct);
});
test('old backups migrate without losing notes and focus results round-trip',()=>{
 const old=freshState();delete old.focus;old.lessons.project={notes:'Keep my original learning notes',done:{},drafts:{}};
 const s=validateState(JSON.parse(JSON.stringify(old)),QUESTIONS,LESSONS.map(l=>l.id));assert.deepEqual(s.focus,{drafts:{}});assert.equal(s.lessons.project.notes,old.lessons.project.notes);
 const q=QUESTION_MAP['f-value-ev'];s.focus.drafts[q.id]={value:'96,000',confidence:'sure'};
 const a=recordAttempt(s,q,'96,000','focus','sure',1000);s.reviews[q.id]=scheduleReview(null,a.correct,a.confidence,1000);
 const restored=validateState(JSON.parse(JSON.stringify(s)),QUESTIONS,LESSONS.map(l=>l.id));assert(restored.attempts[0].correct);assert.equal(restored.focus.drafts[q.id].value,'96,000');assert.equal(restored.reviews[q.id].due,1000+DAY);
 const bad=structuredClone(s);bad.focus.drafts[q.id].value={answer:96000};assert.throws(()=>validateState(bad,QUESTIONS,LESSONS.map(l=>l.id)));
});
test('focus sessions retain original content, source mapping and a different-topic final prompt',()=>{
 assert.equal(FOCUS_SESSIONS.length,3);
 for(const s of FOCUS_SESSIONS){const qs=FOCUS_QUESTIONS.filter(q=>q.sessionId===s.id);assert.equal(qs.length,5);assert(qs.some(q=>q.track==='Judgment'));assert.notEqual(qs[4].lessonId,s.lessonId);assert(s.after.every(id=>LESSONS.some(l=>l.id===id)));assert(s.sources.every(id=>SOURCES.some(x=>x.id===id)));}
});
