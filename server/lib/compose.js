import { getStudy } from './studies.js';
import { isPositive, openIssues } from './agent.js';

/**
 * Turns the session into a finished report.
 *
 * Works with no API key. The negatives are canonical sentences from the study
 * definition, so the assembled report reads as dictated rather than generated.
 * What a key buys is prose quality on the doctor's own shorthand and a better
 * impression — not correctness, which is handled here.
 */

/* Radiologists type in shorthand. Expanding it is rule work, and doing it badly
   is worse than not doing it, so the list is short and unambiguous. Word
   boundaries throughout: "rt" must not match inside "heart". */
const SHORTHAND = [
  [/\brt\b/gi, 'right'],
  [/\blt\b/gi, 'left'],
  [/\bbil\b|\bbilat\b/gi, 'bilateral'],
  [/\bc\/o\b/gi, 'complaining of'],
  [/\bh\/o\b/gi, 'history of'],
  [/\br\/o\b/gi, 'rule out'],
  [/\bs\/o\b/gi, 'suggestive of'],
  [/\bk\/c\/o\b/gi, 'known case of'],
  [/\bnad\b/gi, 'no abnormality detected'],
  [/\bwnl\b/gi, 'within normal limits'],
  [/\bsol\b/gi, 'space-occupying lesion'],
  [/\bich\b/gi, 'intracranial haemorrhage'],
  [/\bsah\b/gi, 'subarachnoid haemorrhage'],
  [/\bsdh\b/gi, 'subdural haematoma'],
  [/\bedh\b/gi, 'extradural haematoma'],
  [/\bmls\b/gi, 'midline shift'],
  [/\bhydroceph\b/gi, 'hydrocephalus'],
  [/\bggo\b/gi, 'ground-glass opacity'],
  [/\bpe\b/gi, 'pulmonary embolism'],
  [/\bctr\b/gi, 'cardiothoracic ratio'],
  [/\bcp angle/gi, 'costophrenic angle'],
  [/\bhsm\b/gi, 'hepatosplenomegaly'],
  [/\bvuj\b/gi, 'vesico-ureteric junction'],
  [/\bpuj\b/gi, 'pelvi-ureteric junction'],
  [/\bcbd\b/gi, 'common bile duct'],
  [/\bdcis\b/gi, 'ductal carcinoma in situ'],
  [/\blvi\b/gi, 'lymphovascular invasion'],
  [/\bnst\b/gi, 'no special type'],
  [/\bihc\b/gi, 'immunohistochemistry'],
];

export function expand(text) {
  let out = String(text || '').trim();
  for (const [pattern, replacement] of SHORTHAND) out = out.replace(pattern, replacement);
  if (!out) return '';

  // Capitalise after every sentence break, not only the first character.
  // Expanding an abbreviation mid-text leaves lowercase starts otherwise:
  // "r/o ICH" became "rule out..." sitting after a full stop.
  out = out.replace(/(^|[.!?]\s+)([a-z])/g, (_, lead, ch) => lead + ch.toUpperCase());
  if (!/[.!?]$/.test(out)) out += '.';
  return out;
}

/* Negation-aware check for whether free text asserts something abnormal.
   A plain keyword search inverts on radiology prose, which is mostly negation:
   "No mass is noted" contains "mass" and means the opposite. */
const ABNORMAL =
  /\b(bleed\w*|haemorrhag\w*|hemorrhag\w*|haematoma|hematoma|mass|masses|lesion|nodul\w*|calculus|calculi|stone|fractur\w*|infarct\w*|shift|effac\w*|dilat\w*|hydrocephalus|collection|abscess|consolidat\w*|effusion|pneumothora\w*|opacit\w*|collapse|thicken\w*|malignan\w*|carcinoma|dysplas\w*|granulom\w*|metasta\w*|obstruct\w*|stricture|inflammat\w*)\b/i;

const NEGATED =
  /\b(no|not|without|free of|negative|unremarkable|normal|intact|patent|clear|absent|preserved|central|nil)\b/i;

export function assertsAbnormal(text) {
  return String(text || '')
    .split(/(?<=[.;:])\s+/)
    .flatMap((s) => s.split(/\s+(?:and|but|with|however|although)\s+/i))
    .some((clause) => ABNORMAL.test(clause) && !NEGATED.test(clause));
}

/** Findings in the study's own reporting order: doctor's words first, then the
 *  canonical sentences for everything answered during the interview. */
export function buildFindings(session) {
  const study = getStudy(session.studyId);
  const answers = session.answers || {};
  const lines = [];

  const own = expand(session.findings);
  if (own) lines.push(own);

  for (const id of study.order) {
    const ask = study.asks.find((a) => a.id === id);
    if (!ask) continue;

    const answer = answers[ask.id];
    if (!answer) continue;

    if (isPositive(ask, answer)) {
      const detail = expand(answers[`${ask.id}.detail`]);
      if (detail) lines.push(detail);
    } else if (answer === 'Pending') {
      lines.push('Ancillary studies are pending at the time of this report.');
    } else if (answer === 'Inadequate') {
      lines.push('The material submitted is inadequate for confident assessment.');
    } else {
      lines.push(ask.negative);
    }
  }

  return lines.join(' ');
}

/** Everything the doctor said was present. Drives the impression. */
export function positiveFindings(session) {
  const study = getStudy(session.studyId);
  const answers = session.answers || {};
  const out = [];

  for (const id of study.order) {
    const ask = study.asks.find((a) => a.id === id);
    if (!ask) continue;
    if (!isPositive(ask, answers[ask.id])) continue;

    const detail = expand(answers[`${ask.id}.detail`]);
    out.push({
      id: ask.id,
      label: ask.question.replace(/\?$/, ''),
      detail: detail || null,
    });
  }
  return out;
}

/**
 * Impression, without a model.
 *
 * A normal study gets two words, matching how these reports are actually
 * signed. Otherwise it carries the doctor's own finding first — that is the
 * reason the study was reported — followed by anything confirmed during the
 * interview, in reporting order.
 */
export function composeImpression(session) {
  const positives = positiveFindings(session);
  const own = expand(session.findings);
  const ownIsAbnormal = assertsAbnormal(own);

  if (!positives.length && !ownIsAbnormal) return 'Normal study.';

  const items = [];
  if (ownIsAbnormal) items.push(own.replace(/\.$/, ''));
  for (const p of positives) items.push((p.detail || p.label).replace(/\.$/, ''));

  if (items.length === 1) return `${items[0]}.`;
  return items.map((body, i) => `${i + 1}. ${body}.`).join('\n');
}

const fmtDate = (d) => {
  const date = d ? new Date(d) : new Date();
  return Number.isNaN(+date) ? '' : date.toLocaleDateString('en-GB');
};

/** Assembles the printable report. */
export function composeReport(session, { impression, findings } = {}) {
  const study = getStudy(session.studyId);
  const p = session.patient || {};
  const answers = session.answers || {};

  const technique =
    (study.contrastOptions && study.contrastOptions[answers.technique]) ||
    (answers.specimen ? `Specimen: ${expand(answers.specimen)}` : '') ||
    '';

  const sections = [];

  if (technique) sections.push(['TECHNIQUE', technique]);

  const indication = session.indication || answers.indication;
  if (indication) sections.push(['CLINICAL INDICATION', expand(indication)]);

  sections.push(['FINDINGS', findings || buildFindings(session)]);
  sections.push([
    study.specialty === 'histopathology' ? 'DIAGNOSIS' : 'IMPRESSION',
    impression || composeImpression(session),
  ]);

  const issues = openIssues(session);
  if (issues.length) sections.push(['NOTE', issues.join('\n')]);

  return {
    header: {
      title: study.name.toUpperCase(),
      name: p.name || '',
      age: p.age || '',
      sex: p.sex || '',
      regNo: p.regNo || '',
      referredBy: p.referredBy || '',
      date: fmtDate(p.studyDate),
      reportedBy: p.reportedBy || '',
    },
    sections,
    issues,
    text: sections.map(([heading, body]) => `${heading}:\n${body}`).join('\n\n'),
  };
}
