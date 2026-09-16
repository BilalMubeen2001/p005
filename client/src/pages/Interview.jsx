import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

/**
 * Step 3. The assistant asks for what is missing, one question at a time.
 *
 * One at a time rather than a form of every question at once. A form invites
 * skimming and bulk-clicking "No"; a single question in front of you gets read.
 * The earlier answers stay on screen above so nothing feels lost.
 */
export default function Interview({ session, onChange, transcript, onTranscript, onBack, onDone }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const [total, setTotal] = useState(0);
  const endRef = useRef(null);

  const refresh = useCallback(
    async (next) => {
      setBusy(true);
      setError('');
      try {
        const out = await api.next(next);
        setState(out);
        setTotal((t) => Math.max(t, out.remaining + (transcript.length || 0)));
        if (out.complete) onDone();
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    },
    [onDone, transcript.length],
  );

  useEffect(() => {
    refresh(session);
    // Runs once on entry; later refreshes are driven by answer().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [transcript.length, state?.question?.id]);

  function answer(value) {
    const q = state.question;
    if (!value || !String(value).trim()) return;

    const next = { ...session, patient: { ...session.patient }, answers: { ...session.answers } };

    // Demographic answers belong on the patient, not in the answer bag.
    if (q.id === 'patient.sex') next.patient.sex = value;
    else if (q.id === 'patient.age') next.patient.age = value;
    else if (q.id === 'indication') next.indication = value;
    else next.answers[q.id] = value;

    onTranscript([...transcript, { q: q.question, a: value }]);
    onChange(next);
    setText('');
    refresh(next);
  }

  const q = state?.question;
  const done = transcript.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <main className="wrap">
      <div className="progress no-print">
        <span className="tiny faint">
          {state?.studyName}
          {state ? ` · ${state.remaining} left` : ''}
        </span>
        <div className="progress-bar">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>

      {transcript.length ? (
        <div className="convo">
          {transcript.map((t, i) => (
            <React.Fragment key={i}>
              <div className="turn ai">{t.q}</div>
              <div className="turn me">{t.a}</div>
            </React.Fragment>
          ))}
        </div>
      ) : null}

      {error ? <div className="banner banner-error">{error}</div> : null}

      {q ? (
        <div className="ask" ref={endRef}>
          <div className="ask-q">{q.question}</div>
          {q.why ? <div className="ask-why">{q.why}</div> : null}

          {q.options ? (
            <div className="ask-options">
              {q.options.map((opt) => (
                <button key={opt} className="opt" disabled={busy} onClick={() => answer(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="row">
              <input
                className="input"
                autoFocus
                placeholder={q.placeholder || 'Type your answer'}
                value={text}
                disabled={busy}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && answer(text)}
                style={{ flex: 1, minWidth: 200 }}
              />
              <button className="btn btn-primary" disabled={!text.trim() || busy} onClick={() => answer(text)}>
                Next
              </button>
            </div>
          )}
        </div>
      ) : busy ? (
        <div className="muted small">Thinking…</div>
      ) : null}

      <div className="row no-print" style={{ marginTop: 22 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          Back to details
        </button>
        <span className="spacer" />
        <button className="btn" onClick={onDone} disabled={busy}>
          Skip the rest and generate
        </button>
      </div>
    </main>
  );
}
