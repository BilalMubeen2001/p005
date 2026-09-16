import { getStudy } from './studies.js';

/**
 * The interview engine.
 *
 * The doctor types a few words. This works out what is still missing and asks
 * for it, one question at a time, in reporting order.
 *
 * Deliberately deterministic. Asking a model "what else do you need to know"
 * gives a different list every run, and on a bad run it skips the question that
 * mattered. These rules ask the same questions every time, which is what makes
 * the assistant trustworthy rather than merely impressive. The model, when a key
 * is present, writes prose — it never decides what to ask.
 */

const said = (text, patterns) =>
  patterns.some((p) => new RegExp(p, 'i').test(text || ''));

/** Answers that mean "there is something here", so a follow-up is warranted. */
function isPositive(ask, answer) {
  if (!answer) return false;
  if (ask.positiveAnswer) return answer === ask.positiveAnswer;
  return answer === 'Yes';
}

/** An answer that leaves the question genuinely open. */
const isUnresolved = (ask, answer) =>
  answer === 'Pending' || (ask.id === 'adequacy' && answer === 'Inadequate');

export function buildQueue(session) {
  const study = getStudy(session.studyId);
  if (!study) throw new Error('Unknown study');

  const { patient = {}, indication = '', findings = '', answers = {} } = session;
  const queue = [];

  /* 1. Demographics the report cannot print without. Asked first because the
        doctor usually knows them without looking anything up. */
  if (!patient.sex) {
    queue.push({
      id: 'patient.sex',
      kind: 'patient',
      question: 'Is the patient male or female?',
      options: ['Male', 'Female'],
      why: 'It prints on the report, and it changes which findings are relevant.',
    });
  }

  if (!patient.age) {
    queue.push({
      id: 'patient.age',
      kind: 'patient',
      question: 'How old is the patient?',
      free: true,
      placeholder: '46 years',
      why: 'Age changes what counts as normal and what needs follow-up.',
    });
  }

  /* 2. The clinical question. A report that does not name what it is answering
        cannot be checked against it. */
  if (!indication.trim()) {
    queue.push({
      id: 'indication',
      kind: 'indication',
      question: 'What is the clinical question?',
      free: true,
      placeholder: 'Head injury, GCS 13. Rule out intracranial bleed.',
      why: 'The impression has to answer it in the first line.',
    });
  }

  /* 3. Technique. Contrast for imaging, specimen detail for histopathology. */
  if (study.contrastOptions && !answers['technique']) {
    queue.push({
      id: 'technique',
      kind: 'technique',
      question: 'How was the study performed?',
      options: Object.keys(study.contrastOptions),
      why: 'The technique paragraph is written from this, and it justifies any limitation you cite.',
    });
  }

  if (study.specimenQuestion && !answers['specimen']) {
    queue.push({
      id: 'specimen',
      kind: 'technique',
      question: study.specimenQuestion,
      free: true,
      placeholder: 'Left breast, 10 o’clock, 4 cm from nipple',
      why: 'The surgeon localises from this line. Vague site costs a second procedure.',
    });
  }

  /* 4. Findings, in reporting order. Anything the doctor already wrote about is
        skipped — the agent should never ask about something already on screen. */
  for (const id of study.order) {
    const ask = study.asks.find((a) => a.id === id);
    if (!ask) continue;

    const already = said(findings, ask.patterns);
    const answer = answers[ask.id];

    if (!already && !answer) {
      queue.push({
        id: ask.id,
        kind: 'finding',
        question: ask.question,
        options: ask.options,
        why: ask.why,
      });
      continue;
    }

    /* A positive answer needs detail, or the report says "yes there is one"
       and nothing useful. */
    if (isPositive(ask, answer) && !answers[`${ask.id}.detail`]) {
      queue.push({
        id: `${ask.id}.detail`,
        kind: 'detail',
        question: ask.followUp,
        free: true,
        why: 'Without this the report states the finding exists but not what it is.',
      });
    }
  }

  return { study, queue };
}

export function nextQuestion(session) {
  const { study, queue } = buildQueue(session);
  const answeredCount = Object.keys(session.answers || {}).length;

  return {
    question: queue[0] || null,
    remaining: queue.length,
    answeredCount,
    studyName: study.name,
    complete: queue.length === 0,
  };
}

/**
 * Anything the report should carry a warning about. Separate from the question
 * queue: these do not block, they travel with the finished report.
 */
export function openIssues(session) {
  const study = getStudy(session.studyId);
  const issues = [];

  for (const ask of study.asks) {
    const answer = session.answers?.[ask.id];
    if (isUnresolved(ask, answer)) {
      issues.push(
        answer === 'Pending'
          ? `${ask.question.replace(/\?$/, '')} — marked pending. This report is not final until resolved.`
          : 'Specimen reported as inadequate. The negative findings below cannot be taken as reassurance.',
      );
    }
  }

  if (!session.patient?.name) issues.push('Patient name is blank on this report.');
  return issues;
}

export { isPositive };
