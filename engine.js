export const STATE_VERSION=1;
export const STORAGE_KEY='pmp-learning-lab-v1';
export const DAY=86400000;
export const INTERVALS=[1,3,7,14,30];
export const normalize=s=>String(s??'').normalize('NFKC').toLowerCase().trim().replace(/[.,!?;:]/g,'').replace(/\s+/g,' ');
export const freshState=()=>({version:STATE_VERSION,lessons:{},attempts:[],reviews:{},settings:{rate:1,voice:''},updatedAt:Date.now()});
export function grade(q,value){
 let correct=false,detail=[];
 if(q.type==='term')correct=q.answer.some(a=>normalize(a)===normalize(value));
 else if(q.type==='mcq')correct=Number.isInteger(value)&&value===q.answer;
 else if(q.type==='multi'){
  const selected=Array.isArray(value)?[...new Set(value)]:[];
  correct=selected.length===q.answer.length&&selected.every(x=>q.answer.includes(x));
  detail=q.choices.map((_,i)=>selected.includes(i)===q.answer.includes(i));
 }else{
  detail=q.answer.map((a,i)=>Array.isArray(value)&&value[i]===a);
  correct=detail.every(Boolean)&&value?.length===q.answer.length;
 }
 return {correct,fraction:detail.length?detail.filter(Boolean).length/detail.length:Number(correct),detail};
}
export function answered(q,value){
 if(q.type==='term')return typeof value==='string'&&!!value.trim();
 if(q.type==='mcq')return Number.isInteger(value)&&value>=0&&value<q.choices.length;
 if(q.type==='multi')return Array.isArray(value)&&value.length>0;
 return Array.isArray(value)&&value.length===q.answer.length&&value.every(x=>Number.isInteger(x)&&x>=0);
}
export function recordAttempt(state,q,value,phase,confidence,now=Date.now()){
 const result=grade(q,value);
 const a={id:`${now}-${state.attempts.length}`,questionId:q.id,lessonId:q.lessonId,phase,value:structuredClone(value),confidence,correct:result.correct,fraction:result.fraction,at:now,mistake:''};
 state.attempts.push(a);
 if(state.attempts.length>5000)state.attempts.splice(0,state.attempts.length-5000);
 state.updatedAt=now;
 return a;
}
export function scheduleReview(previous,correct,confidence,now=Date.now()){
 const due=previous&&previous.due<=now;
 // Early practice may bring a failure forward; it cannot inflate spacing.
 if(previous&&!due&&correct)return {...previous,lastPracticed:now};
 const streak=correct&&confidence!=='guess'?(due?Math.min((previous.streak||0)+1,INTERVALS.length):0):0;
 const delay=correct?(confidence==='guess'?DAY:INTERVALS[Math.min(streak,INTERVALS.length-1)]*DAY):10*60*1000;
 return {due:now+delay,streak,lastReviewed:now,lastPracticed:now,lapses:(previous?.lapses||0)+Number(!correct)};
}
export function enrollLesson(state,lesson,questions,now=Date.now()){
 for(const q of questions.filter(q=>q.lessonId===lesson.id&&q.id!==lesson.pre.id)){
  if(state.reviews[q.id])continue;
  const a=state.attempts.filter(a=>a.questionId===q.id&&a.phase!=='pre').at(-1);
  if(a)state.reviews[q.id]=scheduleReview(null,a.correct,a.confidence,now);
 }
}
export function dueQuestions(state,questions,now=Date.now()){
 return questions.filter(q=>state.reviews[q.id]?.due<=now).sort((a,b)=>state.reviews[a.id].due-state.reviews[b.id].due);
}
export function interleave(questions){
 const remaining=[...questions],result=[];
 while(remaining.length){let i=remaining.findIndex(q=>q.lessonId!==result.at(-1)?.lessonId);if(i<0)i=0;result.push(remaining.splice(i,1)[0]);}return result;
}
export function trackStats(state,questions){
 const result={};
 for(const track of ['Knowledge','Systems','Judgment']){
  const ids=new Set(questions.filter(q=>q.track===track).map(q=>q.id));
  const first=new Map(),latest=new Map();
  for(const a of state.attempts.filter(a=>a.phase!=='pre'&&ids.has(a.questionId))){if(!first.has(a.questionId))first.set(a.questionId,a);latest.set(a.questionId,a);}
  result[track]={count:first.size,first:[...first.values()].filter(a=>a.correct).length,latest:[...latest.values()].filter(a=>a.correct).length};
 }return result;
}
export function validateState(data,questions,lessonIds){
 if(!data||data.version!==STATE_VERSION||!Array.isArray(data.attempts)||data.attempts.length>5000)throw Error('This is not a supported PMP Lab backup.');
 const qmap=new Map(questions.map(q=>[q.id,q]));
 const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
 if(!obj(data.lessons)||!obj(data.reviews)||!obj(data.settings))throw Error('The backup is missing valid progress sections.');
 const clean=freshState();
 for(const [id,l] of Object.entries(data.lessons)){
  if(!lessonIds.includes(id))throw Error('The backup contains an unknown lesson.');
  if(!obj(l)||!obj(l.done||{})||!obj(l.drafts||{}))throw Error('A lesson record is invalid.');
  if(l.notes!==undefined&&(typeof l.notes!=='string'||l.notes.length>50000))throw Error('A note is invalid or too long.');
  if(l.recall!==undefined&&(typeof l.recall!=='string'||l.recall.length>50000))throw Error('A recall response is invalid.');
  if(l.reflection!==undefined&&(typeof l.reflection!=='string'||l.reflection.length>50000))throw Error('A reflection is invalid.');
  if(l.step!==undefined&&(!Number.isInteger(l.step)||l.step<0||l.step>7))throw Error('A lesson step is invalid.');
  if(l.done&&Object.values(l.done).some(v=>typeof v!=='boolean'))throw Error('Invalid stage completion.');
  if(l.completed!==undefined&&typeof l.completed!=='boolean')throw Error('Invalid completion state.');
  if(l.rubric!==undefined&&(!Array.isArray(l.rubric)||l.rubric.some(x=>typeof x!=='boolean')))throw Error('Invalid self-review.');
  if(l.examIds!==undefined&&(!Array.isArray(l.examIds)||l.examIds.some(x=>!qmap.has(x))))throw Error('Unknown assessment item.');
  if(l.examAttemptIds!==undefined&&(!Array.isArray(l.examAttemptIds)||l.examAttemptIds.some(x=>typeof x!=='string')))throw Error('Invalid assessment history.');
  if(l.marks!==undefined&&(!obj(l.marks)||Object.values(l.marks).some(v=>typeof v!=='boolean')))throw Error('Invalid video records.');
  for(const [qid,d] of Object.entries(l.drafts||{})){
   const q=qmap.get(qid);if(!q||!obj(d))throw Error('Invalid saved answer.');
   if(d.confidence!==undefined&&!['','guess','unsure','sure'].includes(d.confidence))throw Error('Invalid confidence.');
   if(d.value!==undefined&&!validValue(q,d.value))throw Error('Invalid draft answer value.');
  }
  clean.lessons[id]={step:0,done:{},drafts:{},marks:{},recall:'',rubric:[],notes:'',completed:false,...structuredClone(l)};
 }
 for(const a of data.attempts){
  const q=qmap.get(a.questionId);
  if(!q||a.lessonId!==q.lessonId||typeof a.id!=='string'||!['pre','recall','lab','decision','exam','review','practice'].includes(a.phase)||!['guess','unsure','sure'].includes(a.confidence)||!Number.isFinite(a.at)||typeof a.mistake!=='string'||a.mistake.length>200||!validValue(q,a.value))throw Error('The backup contains an invalid attempt.');
  clean.attempts.push({...a,...grade(q,a.value)});
 }
 for(const [id,r] of Object.entries(data.reviews)){
  if(!qmap.has(id)||!obj(r)||!Number.isFinite(r.due)||r.due<0||r.due>Date.now()+3660*DAY||!Number.isInteger(r.streak)||r.streak<0||r.streak>INTERVALS.length||!Number.isInteger(r.lapses)||r.lapses<0)throw Error('The backup contains an invalid review schedule.');
  clean.reviews[id]=structuredClone(r);
 }
 const rate=Number(data.settings.rate);clean.settings={rate:[.8,1,1.2,1.5].includes(rate)?rate:1,voice:typeof data.settings.voice==='string'?data.settings.voice:''};
 clean.updatedAt=Number.isFinite(data.updatedAt)?data.updatedAt:Date.now();return clean;
}
function validValue(q,v){
 if(q.type==='term')return typeof v==='string'&&v.length<=2000;
 if(q.type==='mcq')return v===null||Number.isInteger(v)&&v>=0&&v<q.choices.length;
 if(!Array.isArray(v)||v.length>100)return false;
 const max=q.type==='order'?q.items.length:q.choices.length;
 if(!v.every(x=>x===null||Number.isInteger(x)&&x>=0&&x<max))return false;
 if(q.type==='order')return v.length===q.items.length&&new Set(v).size===v.length&&!v.includes(null);
 if(q.type==='multi')return new Set(v).size===v.length&&!v.includes(null);
 return v.length===q.items.length;
}
