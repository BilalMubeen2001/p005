import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/** Step 4. The finished report. */
export default function Report({ session, onBack, onReset }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.report(session).then(setReport).catch((e) => setError(e.message));
  }, [session]);

  function copy() {
    const h = report.header;
    const head = [
      h.title,
      [h.name, h.age, h.sex].filter(Boolean).join('  |  '),
      [h.regNo && `Reg. No: ${h.regNo}`, h.referredBy && `Referred by: ${h.referredBy}`, h.date]
        .filter(Boolean)
        .join('  |  '),
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard?.writeText(`${head}\n\n${report.text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) {
    return (
      <main className="wrap">
        <div className="banner banner-error">{error}</div>
        <button className="btn" style={{ marginTop: 16 }} onClick={onBack}>
          Back
        </button>
      </main>
    );
  }

  if (!report) return <main className="wrap muted">Writing the report…</main>;

  const h = report.header;
  const meta = [
    ['Patient', h.name],
    ['Reg. no', h.regNo],
    ['Age', h.age],
    ['Sex', h.sex],
    ['Referred by', h.referredBy],
    ['Date', h.date],
  ].filter(([, v]) => v);

  return (
    <main className="wrap wide">
      <div className="row no-print" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Report</h1>
        <span className="spacer" />
        <button className="btn btn-sm" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button className="btn btn-sm" onClick={() => window.print()}>
          Print
        </button>
      </div>

      {report.issues?.length ? (
        <div className="banner banner-warn" style={{ marginBottom: 16 }}>
          {report.issues.join(' ')}
        </div>
      ) : null}

      {report.degraded ? (
        <div className="banner banner-info no-print" style={{ marginBottom: 16 }}>
          The model was unreachable, so this was assembled from the local style rules. The content
          is unaffected.
        </div>
      ) : null}

      <article className="paper">
        <div className="paper-head">
          <h2>{h.title}</h2>
          {meta.length ? (
            <div className="paper-meta">
              {meta.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {report.sections.map(([heading, body]) => (
          <section
            key={heading}
            className={`paper-section ${heading === 'IMPRESSION' || heading === 'DIAGNOSIS' ? 'impression' : ''}`}
          >
            <h3>{heading}</h3>
            <p>{body}</p>
          </section>
        ))}

        {h.reportedBy ? (
          <div className="sig small muted">Reported by {h.reportedBy}</div>
        ) : null}
      </article>

      <div className="row no-print" style={{ marginTop: 22 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          Back to questions
        </button>
        <span className="spacer" />
        <button className="btn btn-primary" onClick={onReset}>
          New report
        </button>
      </div>

      <p className="tiny faint no-print" style={{ marginTop: 24 }}>
        Check every line before signing. You are responsible for the content of this report.
      </p>
    </main>
  );
}
