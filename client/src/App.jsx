import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import Pick from './pages/Pick.jsx';
import Intake from './pages/Intake.jsx';
import Interview from './pages/Interview.jsx';
import Report from './pages/Report.jsx';

const BLANK = {
  studyId: null,
  patient: { name: '', regNo: '', age: '', sex: '', referredBy: '', reportedBy: '', studyDate: '' },
  indication: '',
  findings: '',
  answers: {},
};

/**
 * Four steps: pick the study, enter what you know, answer what the assistant
 * asks, read the report.
 *
 * Session state lives here and travels to the server on each call. Nothing is
 * stored server-side, so no patient detail is ever written to disk — the right
 * default for a tool that has not been through information governance.
 */
export default function App() {
  const [step, setStep] = useState(0);
  const [session, setSession] = useState(BLANK);
  const [specialty, setSpecialty] = useState(null);
  const [modelOn, setModelOn] = useState(false);
  const [transcript, setTranscript] = useState([]);

  useEffect(() => {
    api.studies().then((r) => setModelOn(r.model === 'on')).catch(() => {});
  }, []);

  const reset = () => {
    setSession(BLANK);
    setSpecialty(null);
    setTranscript([]);
    setStep(0);
  };

  const steps = ['Study', 'Details', 'Questions', 'Report'];

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">Reporting Assistant</span>
        <div className="steps no-print">
          {steps.map((label, i) => (
            <span key={label} className={i < step ? 'done' : i === step ? 'now' : ''} title={label} />
          ))}
        </div>
        <span className="spacer" />
        <span className="tiny faint no-print">{modelOn ? 'AI prose on' : 'rules mode'}</span>
        {step > 0 ? (
          <button className="btn btn-ghost btn-sm no-print" onClick={reset}>
            Start over
          </button>
        ) : null}
      </header>

      {step === 0 ? (
        <Pick
          specialty={specialty}
          onSpecialty={setSpecialty}
          onPick={(studyId) => {
            setSession({ ...BLANK, studyId });
            setStep(1);
          }}
        />
      ) : null}

      {step === 1 ? (
        <Intake
          session={session}
          onChange={setSession}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      ) : null}

      {step === 2 ? (
        <Interview
          session={session}
          onChange={setSession}
          transcript={transcript}
          onTranscript={setTranscript}
          onBack={() => setStep(1)}
          onDone={() => setStep(3)}
        />
      ) : null}

      {step === 3 ? (
        <Report session={session} onBack={() => setStep(2)} onReset={reset} />
      ) : null}
    </div>
  );
}
