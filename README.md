# Reporting Assistant

Radiology and histopathology reports from a few words of findings.

Doctor picks the study, enters patient details and types what they saw. The
assistant asks about anything missing, one question at a time, then writes the
report and the impression.

## Run it

```bash
npm run install:all
npm run dev
```

Open http://localhost:5173

No database. No login. No `.env` needed. It just runs.

For a single-port production build: `npm run build && npm start`, then open
http://localhost:4000

## Turn on the AI prose

The assistant works fully without a key: the questions, the findings and the
impression are all assembled from local style rules. That is the mode it ships
in.

For model-written prose, get a key at console.anthropic.com, then:

```bash
cp .env.example .env
```

Put the key after `ANTHROPIC_API_KEY=` and restart. The header changes from
"rules mode" to "AI prose on".

What changes: the model rewrites your shorthand into departmental prose and
writes a sharper impression. What does not change: the questions asked, and the
facts in the report. The model is never allowed to decide what is missing or to
add a finding you did not give it.

## Deploy

Push to GitHub, then on render.com: New → Blueprint → pick the repo. `render.yaml`
is already here. Set `ANTHROPIC_API_KEY` if you have one, or leave it blank.

Free tier sleeps after 15 minutes idle, so the first load takes about 30 seconds.
Open the link yourself before a live demo.

## Try this

Pick Radiology → CT Brain. Skip every patient field. In the findings box type:

```
small bleed rt frontal
```

Continue. The assistant asks eleven questions — sex, age, clinical question,
contrast, then each anatomical area you did not mention. It does **not** ask
about haemorrhage, because you already said there was one. Answer "Yes" to
midline shift and it asks how many millimetres.

The report comes out with the technique paragraph, your shorthand expanded to
"Small bleed right frontal", every negative stated in house wording, and a
numbered impression.

## Why the questions are rules, not the model

Asking a model "what else do you need to know" gives a different list every run,
and on a bad run it skips the one that mattered. These rules ask the same
questions every time, in the same order.

That reliability is the product. The model's job is to write well, not to decide
what is clinically necessary.

## Adding studies

`server/lib/studies.js`. Each study lists its questions, the patterns that mean
"already mentioned", and the canonical sentence for a negative answer. Copy an
existing entry and edit it — no other file needs to change.

The `negative` sentences are where house style lives. Replace them with your
department's actual wording and the reports will read as if they were dictated.

## What it does not do

- No image or slide interpretation. It reports what you tell it.
- Nothing is saved. Close the tab and the report is gone — copy or print it first.
- Four radiology studies and two histopathology, as a starting set.
- Shorthand expansion covers common abbreviations only, and it is conservative
  by design. A wrong expansion is worse than none.
