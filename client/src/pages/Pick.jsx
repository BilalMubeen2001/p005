import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/** Step 1. Specialty, then study. */
export default function Pick({ specialty, onSpecialty, onPick }) {
  const [studies, setStudies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!specialty) return;
    api.studies(specialty).then((r) => setStudies(r.studies)).catch((e) => setError(e.message));
  }, [specialty]);

  return (
    <main className="wrap">
      <h1>What are you reporting?</h1>
      <p className="lede">
        Enter the patient details and a few words of what you saw. The assistant asks about
        anything missing, then writes the report.
      </p>

      <div className="tiles" style={{ marginBottom: 28 }}>
        <button
          className="tile"
          aria-pressed={specialty === 'radiology'}
          onClick={() => onSpecialty('radiology')}
        >
          <strong>Radiology</strong>
          <span className="small muted">CT, X-ray and imaging reports</span>
        </button>
        <button
          className="tile"
          aria-pressed={specialty === 'histopathology'}
          onClick={() => onSpecialty('histopathology')}
        >
          <strong>Histopathology</strong>
          <span className="small muted">Biopsy and specimen reports</span>
        </button>
      </div>

      {error ? <div className="banner banner-error">{error}</div> : null}

      {specialty ? (
        <>
          <h2>Choose the study</h2>
          <div className="study-list">
            {studies.map((s) => (
              <button key={s.id} className="study" onClick={() => onPick(s.id)}>
                <strong>{s.name}</strong>
                <span className="small faint">{s.hint}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
}
