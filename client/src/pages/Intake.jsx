import React from 'react';

/**
 * Step 2. Patient details and the doctor's own words.
 *
 * Only the findings box is required. Everything left blank becomes a question
 * in the next step, which is the point — typing is slower than tapping an
 * answer, so the doctor should be able to skip straight past this.
 */
export default function Intake({ session, onChange, onBack, onNext }) {
  const p = session.patient;
  const set = (key, value) => onChange({ ...session, patient: { ...p, [key]: value } });

  return (
    <main className="wrap">
      <h1>Patient details</h1>
      <p className="lede">
        Fill in what you have. Anything you leave blank, the assistant will ask about.
      </p>

      <div className="stack">
        <div className="grid">
          <div className="field">
            <label htmlFor="name">Patient name</label>
            <input id="name" className="input" value={p.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="reg">Registration number</label>
            <input id="reg" className="input" value={p.regNo} onChange={(e) => set('regNo', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="age">Age</label>
            <input id="age" className="input" placeholder="46 years" value={p.age} onChange={(e) => set('age', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="sex">Sex</label>
            <div className="row">
              {['Male', 'Female'].map((v) => (
                <button
                  key={v}
                  className="opt btn-sm"
                  aria-pressed={p.sex === v}
                  style={p.sex === v ? { borderColor: 'var(--violet)', background: 'var(--violet-soft)' } : undefined}
                  onClick={() => set('sex', p.sex === v ? '' : v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="ref">Referred by</label>
            <input id="ref" className="input" value={p.referredBy} onChange={(e) => set('referredBy', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="date">Study date</label>
            <input id="date" type="date" className="input" value={p.studyDate} onChange={(e) => set('studyDate', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="ind">Clinical question</label>
          <input
            id="ind"
            className="input"
            placeholder="Head injury, GCS 13. r/o ICH"
            value={session.indication}
            onChange={(e) => onChange({ ...session, indication: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="find">What did you see?</label>
          <textarea
            id="find"
            className="textarea"
            placeholder="A few words is enough. e.g. small bleed rt frontal"
            value={session.findings}
            onChange={(e) => onChange({ ...session, findings: e.target.value })}
          />
          <span className="tiny faint">
            Shorthand is fine. rt, lt, r/o, SOL, NAD and the usual abbreviations are expanded for you.
          </span>
        </div>

        <div className="row" style={{ marginTop: 6 }}>
          <button className="btn btn-ghost" onClick={onBack}>Back</button>
          <span className="spacer" />
          <button className="btn btn-primary" onClick={onNext}>Continue</button>
        </div>
      </div>
    </main>
  );
}
