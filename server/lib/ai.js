import { getStudy } from './studies.js';
import { buildFindings, composeImpression, positiveFindings, expand } from './compose.js';

/**
 * Optional model layer.
 *
 * Without ANTHROPIC_API_KEY the app is fully functional: rules ask the
 * questions, canonical sentences build the findings, and the impression is
 * assembled from the positives. With a key, the model rewrites the doctor's
 * shorthand into departmental prose and writes a sharper impression.
 *
 * The model never decides what is missing and never invents a finding. It is
 * handed the answers the doctor gave and told to say them well. If the call
 * fails, composition falls back to rules rather than erroring — the doctor
 * still gets a report.
 */

/* Read at call time, not at module load. ES module imports are hoisted and
   evaluated before any statement in the entry file runs, so a key read into a
   module-level const here would be captured before .env had been loaded — and
   would silently always be undefined. */
const key = () => process.env.ANTHROPIC_API_KEY;
const model = () => process.env.ASSISTANT_MODEL || 'claude-sonnet-4-6';

export const modelAvailable = () => Boolean(key());

async function call(system, user, maxTokens = 900) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model(),
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!res.ok) throw new Error(`Model request failed (${res.status})`);

  const data = await res.json();
  return (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

/**
 * House style is shown as examples rather than described. Telling a model to
 * "be concise and professional" produces generic radiology English; showing it
 * the department's own sentences produces the department's.
 */
function systemPrompt(study) {
  return [
    `You write ${study.specialty} reports for a hospital reporting assistant.`,
    '',
    'House style:',
    '- Short declarative sentences. Never "there appears to be" or "cannot be excluded" unless the doctor said so.',
    '- A study with no abnormal findings has the impression "Normal study." and nothing more.',
    '- Report in anatomical order, matching the findings.',
    '- British spelling. Expand abbreviations the doctor used.',
    '- Never restate the technique or the clinical history in the impression.',
    '',
    'Examples of the required voice:',
    ...study.asks.slice(0, 4).map((a) => `- "${a.negative}"`),
    '',
    'Absolute constraints:',
    '- Use only the findings supplied. Never add a finding, a measurement, a laterality or a degree of certainty that is not in the input.',
    '- If a finding is described vaguely, keep it vague. Do not sharpen it.',
    '- Do not invent normal findings for anything not mentioned.',
    '',
    'Return the requested text only. No headings, no preamble, no commentary.',
  ].join('\n');
}

/** Rewrites the assembled findings into flowing prose. */
export async function polishFindings(session) {
  const study = getStudy(session.studyId);
  const assembled = buildFindings(session);
  if (!key() || !assembled) return { text: assembled, model: null };

  try {
    const text = await call(
      systemPrompt(study),
      [
        'Rewrite the following findings as a single flowing FINDINGS paragraph in house style.',
        'Keep every statement. Change wording and order for readability only.',
        '',
        assembled,
      ].join('\n'),
    );
    return { text: text || assembled, model: model() };
  } catch {
    return { text: assembled, model: null, degraded: true };
  }
}

/** Writes the impression from the findings and the clinical question. */
export async function writeImpression(session) {
  const study = getStudy(session.studyId);
  const fallback = composeImpression(session);
  if (!key()) return { text: fallback, model: null };

  const positives = positiveFindings(session);

  try {
    const text = await call(
      systemPrompt(study),
      [
        `Clinical question: ${expand(session.indication) || 'not stated'}`,
        '',
        'Findings:',
        buildFindings(session),
        '',
        positives.length
          ? `Abnormal findings confirmed by the reporting doctor: ${positives.map((p) => p.detail || p.label).join('; ')}`
          : 'The reporting doctor confirmed no abnormal findings.',
        '',
        'Write the impression. Answer the clinical question in the first sentence. If there are several abnormal findings, number them in order of clinical importance. If there are none, the impression is "Normal study."',
      ].join('\n'),
      500,
    );
    return { text: text || fallback, model: model() };
  } catch {
    return { text: fallback, model: null, degraded: true };
  }
}
