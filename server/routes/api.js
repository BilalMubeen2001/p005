import { Router } from 'express';
import { studies, studiesFor, getStudy } from '../lib/studies.js';
import { nextQuestion } from '../lib/agent.js';
import { composeReport } from '../lib/compose.js';
import { polishFindings, writeImpression, modelAvailable } from '../lib/ai.js';

const router = Router();

/**
 * Stateless. The whole session travels in the request body, so there is no
 * database to configure and nothing to lose on a restart. It also means no
 * patient detail is ever written to disk, which is the right default for a
 * tool that has not been through information governance.
 */

router.get('/studies', (req, res) => {
  const { specialty } = req.query;
  res.json({
    studies: (specialty ? studiesFor(specialty) : studies).map((s) => ({
      id: s.id,
      specialty: s.specialty,
      name: s.name,
      hint: s.hint,
    })),
    model: modelAvailable() ? 'on' : 'off',
  });
});

/** What the assistant needs next. Called after every answer. */
router.post('/next', (req, res) => {
  try {
    res.json(nextQuestion(req.body || {}));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/** Builds the finished report. */
router.post('/report', async (req, res) => {
  const session = req.body || {};
  try {
    if (!getStudy(session.studyId)) return res.status(400).json({ error: 'Choose a study first.' });

    const findings = await polishFindings(session);
    const impression = await writeImpression(session);

    const report = composeReport(session, {
      findings: findings.text,
      impression: impression.text,
    });

    res.json({
      ...report,
      model: impression.model,
      degraded: Boolean(findings.degraded || impression.degraded),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not build the report.' });
  }
});

export default router;
