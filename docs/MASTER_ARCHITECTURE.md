# Master lesson architecture

Version 1 · 11 November 2026

## Educational goal

Build usable project-management understanding through small cycles of effort, feedback and delayed retrieval. Passing an exam is a possible later outcome, not the app’s completion metric. One recurring campus access-control project creates continuity with the learner’s earlier FAR field examples. The board and visible progression adapt FAR Academy’s structure; the light purple, coral and teal treatment follows the user's requested PMI-inspired direction.

## Three independent learning tracks

| Track | Evidence | Interaction |
|---|---|---|
| Knowledge | Can name and explain the distinction | MCQ, multi-select, typed terminology |
| Systems | Can reconstruct relationships and dependencies | Matching, ordering, categorization, interactive diagrams |
| Judgment | Can choose an action suited to context | Scenario decisions and transfer questions |

These are app pedagogy, not the three PMP exam domains or the PMBOK performance domains. Track performance shows first and latest correct responses on distinct attempted prompts. It is not a prediction of an official exam score.

## The reusable cycle

| Stage | Learner action | Evidence / completion |
|---|---|---|
| Preview | Read a short situation; choose a work connection | Acknowledge intention; note is optional |
| Optional pre-test | Try before instruction and record confidence | Baseline kept separate from scored progress |
| Learn | Read the complete offline primer, explore the visual, optionally watch mapped Udemy lectures | Explicit reading/viewing acknowledgement; video ticks stay separate |
| Recall | Type a term and explain the distinction from memory | Local terminology check; 20+ characters and all self-rubric points checked |
| Connect | Reconstruct a relationship | Complete a matching, ordering or categorization exercise |
| Apply | Make a contextual decision | Checked answer plus rationale and distractor explanation |
| Mini-exam | Answer two new transfer items, plus one prior completed-topic prompt when available | All answers and confidence required; feedback withheld until submission |
| Reflect | Classify misses and articulate a correction | All graded misses classified and a written reflection; enroll review prompts |
| Revisit | Retrieve after a delay, mixed with other topics | Local feedback and interval adjustment |

Stages can be revisited directly. Completing a lesson requires the seven required stages; clicking through navigation does not mark completion. Wrong answers do not block learning indefinitely: they create explicit correction and review obligations. There is no arbitrary mastery threshold.

## Implemented module: Project Management Terms

| ID | Micro-lesson | Course lecture mapping | Visual / exercise |
|---|---|---|---|
| project | Projects & operations | Project Operations and Project Management | Transition flow; classify work |
| portfolio | Projects, programs & portfolios | Programs and Portfolio | Nested strategic view; match management lenses |
| value | Value, outcomes & change | Value and Changes | Value chain; reconstruct causal order |
| lifecycle | Phases, deliverables & lifecycles | Phase and Deliverables; Project Lifecycle | Tailored lifecycle; order an evidence-based pilot gate |
| stakeholders | Stakeholders & perspectives | Stakeholders | Influence/impact contrast; match roles |
| governance | Structure, authority & the PMO | Organizational Structures; PMO | Authority spectrum; match course PMO categories |
| constraints | Constraints & tradeoffs | Constraints | Tap to explore linked constraints; match limits |
| approaches | Predictive, adaptive & hybrid | Project Management Approaches | Compare components; categorize delivery choices |
| risk | Risk, issues & uncertainty | Risk vs Issues | Uncertainty-to-issue flow; classify evidence |
| leadership | Leadership & emotional intelligence | Leadership vs Management; Emotional Intelligence | Contextual response routine; match contributions |
| ai | AI terms & human judgment | AI Terms | Assistance/evidence/decision flow; match AI concepts |

Each unit has six scored original items: one optional baseline, one terminology recall, one systems exercise, one scenario decision, and two transfer items. There are 66 items total; 55 enter the review pool after their respective learning loops. Lessons are approximately 13–17 active minutes plus course video time, and can be split across sessions. Durations are planning estimates, not required timers.

## Future course expansion

1. Introduction: orientation and a personal application goal (embedded now).
2. Project Management Terms: implemented.
3. Principles: dilemmas using the six PMBOK 8 principles, with value and sustainability explicit.
4. Approaches and processes: map focus areas, seven performance domains and artifact relationships without treating them as a rigid universal lifecycle.
5. PMBOK 8 processes: evolve the same project and artifacts; show why information and decisions connect.
6. Agile: manipulate backlogs, flow, feedback and team practices; distinguish frameworks and context.
7. Hybrid: tailor delivery components while coordinating dependencies.
8. Mindset: contrast conditional heuristics with justified actions, including exceptions and urgency.
9. Closing and mock exam: synthesize; calibrate with the learner’s separately licensed Study Hall evidence later.

Do not unlock empty lesson pages or label plans as implemented. Expand only after reviewing the learning pattern and adding comparable depth and feedback.

## Content contract

Each `LESSONS` record has stable `id`, number, title, subtitle, approximate active duration, lecture mapping, objectives, source IDs and reference scope, primer, listening cue, concepts, visual model, misconception, recall prompt, rubric, work-language example, baseline, recall question, relationship exercise, decision and transfer items.

Questions require stable IDs, type, track, prompt, canonical answer, explanation and mistake lens. MCQ questions include distractor-specific explanations. `QUESTIONS` adds lesson/source provenance. A scenario is pedagogically distinct but uses the tested MCQ renderer. Never include answer text in a prompt inadvertently. Questions are not randomized on every render; drafts and item identity remain stable.

Author new visuals as accessible HTML/CSS or inline SVG with a textual equivalent. Use manipulation only when it strengthens understanding. Avoid decorative complexity and mandatory dragging on touch devices.

## Retrieval policy

Initial missed answers: 10 minutes. Initial correct answers: 1 day. Correct due retrievals with non-guess confidence increase the schedule to 3, 7, 14 and 30 days; 30 is the maximum. Guessing resets the progression and returns in one day. Failure returns in 10 minutes and resets the progression. Correct early practice never increases spacing; an early failure can bring work forward. This policy is transparent and intentionally modest, not a validated personalized forgetting-curve algorithm.

The review studio alternates lessons where possible and caps a session at ten prompts. Mini-exams include a due prior concept if available, otherwise another enrolled prior concept. The app has no background notification service. Device time controls the due queue.

## State and portability

The v1 state stores lesson stages, drafts, confidence, viewing ticks, notes, explanation rubrics, exam attempt IDs, reflections, immutable attempt history and review schedules. Keep IDs stable across content updates. Version and validate future migrations. Never silently treat a new question as an old one with a different answer. Retain a bounded 5,000-attempt history; older attempts beyond that cap are removed, so first-attempt summaries describe retained history after that point.

Backups are JSON with a schema version. Validate before replacement, export the prior state, reject unknown IDs, recompute scores from current answer keys, preserve unreadable raw local data for download. Imported text is always HTML-escaped. No upload is performed.

## Release gate

Check content keys and all grading types, completion gates, progress reload, draft recovery, mixed reviews, due/early scheduling, backup validation and corrupt-data recovery. Verify the `/pmp/` subpath, offline navigation to previously unopened lessons, cache readiness, update activation, keyboard/touch controls and layouts at iPad portrait/landscape and phone width. Test speech and actual installation on a physical iPad before promising device-specific audio behavior.
# Focus practice extension · 11 November 2026

The 11 Terms lessons remain the main eight-stage path. Three optional bridge sessions add depth without representing new course chapters or replacing the assigned Udemy videos. Each names prerequisite/related Terms lessons, then presents a visual primer followed by five sequential scored prompts and a retrieval plan. Incorrect responses require mistake classification before advancing. The final prompt draws on a different Terms concept.

- Decision states: distinguish proposed changes, approved work, immediate hazards and authorized closure. A pair changes the approval state while keeping the project context stable.
- Tool purpose: switch a ranked chart between incident count and downtime; contrast prioritization with cause investigation; distinguish bottom-up, parametric and analogous estimating.
- Earned value: manipulate planned doors, completed doors and actual spending. Calendar, completed-door and receipt icons anchor PV, EV and AC. Enter numeric CV and reconstructed EV before interpreting a new scenario.

Keep the Knowledge, Systems and Judgment labels. Store focus drafts separately from lesson state; reuse the shared attempt and review model. Attempted focus questions enter the existing review schedule immediately. Core mini-exams exclude unseen focus prompts. Older version-1 backups migrate with an empty focus-draft section and retain lesson progress.

Mindset guidance is a conditional reference, not another official PMI principle list. Compare available answers using the facts, authority, urgency and objective; label instructor heuristics, framework rules and original applications separately. The 2026 ECO continues to define exam coverage. Never infer a PMP pass prediction from supplemental CAPM results.

## Follow-on content priorities

When the relevant course chapters are implemented, add: Scrum roles and Definition of Done; velocity and explicit lead/cycle-time boundaries; stakeholder and BA role distinctions; requirements traceability; risk responses and reserves; dependencies and estimating uncertainty. Preserve small lessons and worked visual examples rather than expanding the Terms module into a full-course overview.
