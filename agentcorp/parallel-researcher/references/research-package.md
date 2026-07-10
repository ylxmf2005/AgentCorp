# Research Package: When Research Has to Get Hands-On

A report that says "this SDK works" and a record where you actually installed it, got it running, and left the run logs on disk are two entirely different kinds of evidence. Whenever a decision hinges on research into "can it run / how well does it integrate," the deliverable should not be a report — it should be a **research package**: the report is just the entry point and index, while the folder holds reproducible experiments, locally captured official docs, and empirically grounded selection conclusions. Downstream architect/engineer agents consume this folder directly, without having to search again or hit the same pitfalls.

## Three Depth Tiers

Set the tier by decision type; don't run the full thing every time:

- `desk`: a purely cognitive question (domain landscape, concept clarification, market scan). Produces a single report.
- `source-verified`: the conclusion depends on whether some claim is true. Adds source-level verification on top of `desk` (see research-method.md).
- `hands-on`: the decision depends on "can it run / how big is the integration cost / which SDK to choose." Produces a full research package.

When the assignment names a tier, follow it; when it doesn't, set the tier yourself using the criteria above and record the tier and your reasoning in the Research Brief. When unsure, ask yourself: is the originator's next move after reading the report going to be "have someone try it"? If so, that "try it" step is exactly what you should do now.

## Directory Skeleton

```
research/<topic-slug>/
├── 00-report.md              # decision report (skeleton in research-method.md), the single entry point of the package
├── experiments/
│   ├── README.md             # experiment index: one line per experiment (question / ✅❌⏱ / one-line conclusion)
│   └── exp-01-<slug>/        # number + short name; one experiment answers one question
│       ├── NOTES.md          # see "Experiment Discipline"
│       ├── env/              # requirements.lock.txt + ENV.md (python/SDK versions, copy-paste install commands)
│       ├── src/              # experiment code, rerunnable with one command
│       └── runs/run_01/      # output.log + meta.json + a code snapshot of this run
└── docs-snapshot/
    ├── INDEX.md              # see "Documentation Snapshot"
    └── <.md files sectioned by topic>
```

Trim as needed: if you ran no experiments there's no `experiments/`, if you captured no docs there's no `docs-snapshot/`, but whatever does exist must conform to the contract in this file.

## Experiment Discipline

- **Question first**: before touching anything, write `QUESTION` (what this experiment answers), `SUCCESS CRITERIA` (what counts as working), and `TIMEBOX` in `NOTES.md`; after the run, fill in `ANSWER` and an excerpt of the key output. An experiment you can't summarize in a paragraph isn't finished.
- **Single-command rerun**: every experiment must rerun with one command (e.g. `python src/main.py`), with no hidden steps; lock the environment into `env/requirements.lock.txt` with `pip freeze`, and record the python version and install commands in `env/ENV.md`. A fresh agent that has read none of this task's context should be able to reproduce the result from this directory alone — that is the bar for a valid experiment.
- **Baseline first**: get the official quickstart/hello-world running as-is first, as run_01, then build variants closer to this task's scenario. If the baseline doesn't run, everything after it is built on air.
- **Leave a trail of output**: stream run output to disk in real time with `tee` into `runs/run_NN/output.log`, and in the report quote only excerpts plus pointers — never paraphrase from memory; `meta.json` records `{command, exit_code, duration_s, verdict: ok|failed, analysis}`; on every meaningful run, snapshot the experiment code as it was into the run directory (the agent will change the code between runs, and without a snapshot you can't trace which code version produced which result).
- **Failure is a first-class deliverable**: don't delete the runs that wouldn't install, wouldn't run, or had version conflicts — name the directory after the cause (e.g. `run_02-fail-version-conflict/`). "We tried X, it didn't work, because Y" is often worth no less to a downstream decision than a success example.
- **Hard budget**: if the same error survives 3 fix attempts, change course (different install method, different version, different example) rather than burning the budget down one dead end; when the TIMEBOX is up you must commit a conclusion to disk, even if it's "didn't get it running, stuck on X."
- **Experiment code is for verification**: mark it "for verification, not production quality" in `experiments/README.md`. Its job is to answer the question, not to ship.

## Execution Boundaries

Reading evidence and running experiments are two separate zones with different red lines:

- **Evidence-reading zone** (someone else's cloned repo): keep it read-only — don't execute any of its scripts, setup.py, or CI config.
- **Experiment zone** (code you wrote yourself + dependencies installed from official registries): you may execute it, but only inside an isolated venv or temporary directory, without polluting the system environment; install dependencies only from official registries (PyPI/npm, etc.), and verify the package name's spelling before installing (typosquatting is a real attack surface); use no production credentials and access no production systems; clean up any processes the experiments spawn when you wrap up.

## Documentation Snapshot

The goal is to let a downstream agent consume "the slice of the docs this decision needs" offline — not to mirror the whole site. Take it in tiers:

1. Probe `https://<docs-domain>/llms.txt` (note that it may live on the docs subdomain). On a hit, save it to disk as the index and fetch individual pages as needed — many sites support appending `.md` to a URL to get clean markdown directly, so try that channel first.
2. The docs source lives in a repo (mkdocs/docusaurus/sphinx are common): `git clone --filter=blob:none --sparse` to pull only `docs/`, and check out the tag matching the version you're researching. Judgment call: if the `.md` files in `docs/` are readable when opened, use them; if they're full of template directives and autodoc placeholders, abandon this and move to the next tier.
3. Only a rendered site exists: for a few pages, convert each to markdown with `curl -s "https://r.jina.ai/<page-URL>"`; for a whole subtree, use a local tool like crawl4ai.
4. Never do a full-site HTML mirror with wget/httrack — the HTML noise multiplies the token count and downstream agents can't use it.

`INDEX.md` is the snapshot's contract with downstream and must include: source URLs, the repo and version/commit, the capture date, the capture method, a file manifest (one sentence per file), an **explicit "what's not included"** (to keep downstream from assuming the snapshot is the complete set), and known gaps.

## Three Assertion States

In the Findings of `00-report.md`, tag each capability assertion with its evidence level:

- **Verified**: attach a run-evidence pointer (`experiments/exp-01-*/runs/run_01/output.log`).
- **Verification failed**: tried it, didn't get it running — attach the failed-run pointer and the cause.
- **Unverified**: from docs or source reading only, never actually run.

A statement like "this SDK supports X" appearing in a recommendation rationale without a tag is gussied-up guesswork passed off as fact.

## Teamspace Promotion

A research package belongs to the current task by default. At wrap-up, judge once: does the documentation snapshot or an experiment conclusion have reuse value for the **next, different task** (the same technology is likely to come up again)? If so, copy the relevant part to `teamspace/knowledge/<tech>/` and note the source task and date in its INDEX.md; follow the same dedup rule as the compound store — first check whether an old snapshot already exists in `teamspace/knowledge/`, and on high overlap update the old one rather than starting fresh. Conversely, **at the start of every research effort, check `teamspace/knowledge/` first**; on a hit, confirm the version is current and reuse it directly, saving a round of fetching.

## Pre-Delivery Self-Check (Research Package Part)

- The `experiments/README.md` index covers every experiment directory; every experiment's NOTES.md has its ANSWER filled in.
- Every experiment reruns with one command and has its env fully locked; every failed run is on file.
- Every capability assertion in the report carries a three-state tag; every "Verified" one has a clickable log pointer.
- The `docs-snapshot/INDEX.md` contract fields are complete and state "what's not included."
- A teamspace-promotion judgment was made (one line near the report's Follow-Up: what was promoted, or why nothing was).
