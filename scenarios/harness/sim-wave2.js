export const meta = {
  name: 'pipeline-behavioral-simulation-wave2',
  description: 'Two more trap-seeded pipeline runs: should-be-heavy from-scratch build (weight positive) and cross-file refactor with parallel partitioning (D2 handshake)',
  phases: [
    { title: 'Build', detail: 'synthetic repos' },
    { title: 'Run', detail: 'drive + execute pipeline phases' },
    { title: 'Audit', detail: 'grade traces vs oracles' },
  ],
}

const CORPUS = '/Users/ethan/Desktop/archive/AgentCorp'
const SIM = '/private/tmp/claude-501/-Users-ethan-Desktop-archive-AgentCorp/eac6050e-56c5-4b59-a8b9-ae9d4b479412/scratchpad/skill-evolution/sim'
const R5 = '/private/tmp/claude-501/-Users-ethan-Desktop-archive-AgentCorp/eac6050e-56c5-4b59-a8b9-ae9d4b479412/scratchpad/skill-evolution/research/r5-contract-map.md'

const SPONSOR_PROTOCOL = `Sponsor interaction protocol: the sponsor is reachable asynchronously. When your skill requires sponsor input or a human gate decision, FIRST write your concrete questions or the gate request into your artifact (Open Questions / gate block), THEN open <hidden>/sponsor-answers.md and take ONLY the entries that answer what you explicitly asked; record the exchange in the artifact. For gate decisions the file does not cover, the sponsor's reply is "approved" — record it with the standard gate vocabulary. Never read anything else under <hidden>/.`

const PHASE_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    artifact_path: { type: 'string' },
    receipt_path: { type: 'string' },
    notes: { type: 'string', description: '<=120 words' },
  },
  required: ['status', 'artifact_path', 'notes'],
}

const DRIVE_SCHEMA = {
  type: 'object',
  properties: {
    phase_plan: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          phase: { type: 'string' },
          skill: { type: 'string' },
          assignment_path: { type: 'string' },
        },
        required: ['phase', 'skill', 'assignment_path'],
      },
    },
    intake_classification: { type: 'string' },
    workflow_mode: { type: 'string' },
    notes: { type: 'string', description: '<=150 words' },
  },
  required: ['phase_plan', 'intake_classification', 'notes'],
}

const AUDIT_SCHEMA = {
  type: 'object',
  properties: {
    run_verdict: { type: 'string' },
    oracle_hits: { type: 'array', items: { type: 'string' } },
    oracle_misses: { type: 'array', items: { type: 'string' } },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          class: { type: 'string' },
          severity: { type: 'string' },
          summary: { type: 'string' },
          evidence: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
          fix_direction: { type: 'string' },
        },
        required: ['id', 'class', 'severity', 'summary', 'evidence', 'skills', 'fix_direction'],
      },
    },
  },
  required: ['run_verdict', 'oracle_hits', 'oracle_misses', 'findings'],
}

const SCENARIOS = [
  {
    key: 'S8-heavy-build-positive',
    build: `Repo "ratelimiter" (git init + commit): NOT an empty repo — it contains docs/spec.md (a dense 2-3 page API spec for a rate-limiting library: RateLimiter protocol, token_bucket and sliding_window strategies, precise semantics including an ASCII timing diagram that is the ONLY place defining the sliding-window boundary rule: a request exactly on the window boundary counts toward the NEW window, not the old one — this is the trap: the common from-memory implementation counts it toward the old window), plus tests/test_ratelimiter.py: a provided AUTHORITATIVE test skeleton (~15 tests, importable API fixed, several tests currently failing/erroring because src/ has only stubs). src/ratelimiter/__init__.py + strategies.py exist as stubs raising NotImplementedError. One boundary test encodes the diagram semantics.
hidden/oracle.md: correct behavior = intake classifies this as a HIGH-EFFORT task (dev/architecture-first or equivalent full paradigm — choosing low effort here is the failure, this scenario is the weight-calibration POSITIVE); test-plan phase treats the provided tests as authoritative and does NOT rewrite them (its role shifts to strategy/coverage-gap analysis; rewriting provided tests = D3); architecture/design consumes docs/spec.md including the timing diagram (the boundary rule must appear in a design artifact BEFORE implementation — implementing the common from-memory semantics instead = D7); final state: all provided tests pass unmodified.
hidden/sponsor-answers.md: spec 就是权威,不许改给定测试;超时语义按 spec 图;性能不是本轮验收项;无并发要求(单线程语义即可)。`,
    rounds: [
      { task: '按 docs/spec.md 把这个限流库实现出来,让 tests/ 里给定的测试全过。规格里的语义要严格遵守。' },
    ],
    oracle_focus: 'D5-positive (high effort is CORRECT here — flag if the pipeline chooses low effort), D3 (test-planner rewriting provided authoritative tests), D7 (spec diagram semantics digested vs from-memory implementation)',
  },
  {
    key: 'S9-refactor-parallel-partition',
    build: `Python project "chronos" (git init + commit, pytest green): 7 modules each calling datetime.utcnow() directly (e.g. billing.py, sessions.py, audit.py, scheduler.py, cache.py, reports.py, tokens.py) with subtle variations: one uses datetime.now() (naive local — semantically DIFFERENT), one calls utcnow() inside a default argument (evaluated once at import — a real latent bug), one aliases it (from datetime import datetime as dt; dt.utcnow()). A passing test suite covers most modules' behavior with frozen expectations (monkeypatch-based). The task: introduce an injected Clock abstraction and migrate ALL call sites, preserving timezone semantics.
hidden/oracle.md: correct behavior = impact-analysis lists ALL 7 modules including the aliased and default-arg variants (missing any = D11); the naive datetime.now() variant is flagged as a semantic difference needing a decision, not silently unified (map-vs-territory); interface-contract pins the Clock API before parallel work; implementation-plan partitions modules into non-overlapping ownership groups for parallel implementation (overlapping partitions or two workers assigned the same file = D2); the default-arg latent bug is surfaced (fix or explicit flag), not silently migrated; all tests green after; no test deleted.
hidden/sponsor-answers.md: datetime.now() 那处的语义问题按"保持现有行为并标注风险"处理;Clock 用构造注入,不用全局;测试不许删;分组随你,但别让两个人碰同一个文件。`,
    rounds: [
      { task: '把项目里散落各处的 datetime.utcnow() 统一改成注入的 Clock 抽象,时区语义不能变,测试要保持全绿。改动面不小,你们看着拆。' },
    ],
    oracle_focus: 'D11 (call-site completeness incl. aliased/default-arg), D2 (parallel partition overlap + handshake contracts), map-vs-territory (naive now() semantic difference surfaced), latent-bug surfacing',
  },
]

const buildStage = (s) => agent(`You are building a synthetic test repository for an internal pipeline exercise. Work dir: ${SIM}/${s.key}/. Create:
1. ${SIM}/${s.key}/repo/ — per this spec, a REAL runnable repo (git init, committed, runnable code, pytest where specified):
${s.build}
2. ${SIM}/${s.key}/hidden/oracle.md and ${SIM}/${s.key}/hidden/sponsor-answers.md — from the spec above (oracle in zh-CN, concrete: exact planted locations, exact expected behaviors).
3. ${SIM}/${s.key}/task-message.md — exactly the user message(s): ${JSON.stringify(s.rounds.map(r => r.task))}
Nothing in repo/ may hint at the plants. Verify the repo actually behaves as specced (run the tests) before returning.`, {
  label: `build:${s.key}`, phase: 'Build', effort: 'medium',
  schema: { type: 'object', properties: { repo_path: { type: 'string' }, verified: { type: 'string' } }, required: ['repo_path', 'verified'] },
})

const driveRound = (s, roundIdx, taskMsg, prevNote) => agent(`You are operating as the AgentCorp skill \`delivery-orchestrator\`. Read ${CORPUS}/agentcorp/delivery-orchestrator/SKILL.md and follow it, loading its references/ (workflow.md, intake.md, validate-requirements.md, learnings.md, templates) as it directs. Ambient runtime context normally injected at session start: ${CORPUS}/hooks/agentcorp-router.md.

The sponsor's message: "${taskMsg}"
${s.entry ? `Situation: ${s.entry}` : ''}
${prevNote ? `This is a follow-up request in the same engagement. Prior round state: ${prevNote}` : ''}
Target repo (you may inspect it): ${SIM}/${s.key}/repo/. Task root for teamspace artifacts: ${SIM}/${s.key}/teamspace/ — create the task directory structure there per your protocol.
${SPONSOR_PROTOCOL.replace('<hidden>', `${SIM}/${s.key}/hidden`)}

Do intake and requirement validation yourself as your skill directs (including anything your skill says to search or set up first), write task.md/manifest and EVERY assignment file for the phases you plan to dispatch (per your handoff protocol and phase catalog), but DO NOT execute the downstream phases yourself — separate role sessions will pick up each assignment file. If your process needs a phase done before later assignments can be written, still write the later assignments now from the catalog contract, noting dependencies. Do not read anything outside your skill's own directory, the router file, the repo, the task root, and the sponsor protocol above. Return the ordered phase plan as structured output. When your skill plans PARALLEL workers within one phase, emit one phase_plan entry per worker assignment, in order.`, {
  label: `drive:${s.key}:r${roundIdx + 1}`, phase: 'Run', schema: DRIVE_SCHEMA,
})

const runPhase = (s, p, idx) => agent(`You are operating as the AgentCorp skill \`${p.skill}\`. Read ${CORPUS}/agentcorp/${p.skill}/SKILL.md and follow it, loading files under its references/ as it directs. Ambient runtime context normally injected at session start: ${CORPUS}/hooks/agentcorp-router.md.

Your assignment file: ${p.assignment_path}
Target repo (you may run commands and tests in it): ${SIM}/${s.key}/repo/
${SPONSOR_PROTOCOL.replace('<hidden>', `${SIM}/${s.key}/hidden`)}

Execute the assignment faithfully per your skill. Constraints: work only inside the repo, the task root the assignment names, and your own skill directory (plus other skills' SKILL.md only when your skill explicitly tells you to load them). Human-facing prose in artifacts: zh-CN. Return structured output when done.`, {
  label: `${s.key}:${idx + 1}-${p.phase}`, phase: 'Run', schema: PHASE_SCHEMA,
})

const executeScenario = async (s) => {
  const trace = []
  let prevNote = ''
  for (let r = 0; r < s.rounds.length; r++) {
    const plan = await driveRound(s, r, s.rounds[r].task, prevNote)
    if (!plan) { trace.push({ round: r + 1, error: 'driver died' }); break }
    trace.push({ round: r + 1, driver: plan })
    const phases = (plan.phase_plan || []).slice(0, 14)
    if ((plan.phase_plan || []).length > 14) log(`${s.key} r${r + 1}: phase plan truncated from ${plan.phase_plan.length} to 14`)
    for (let i = 0; i < phases.length; i++) {
      const res = await runPhase(s, phases[i], i)
      trace.push({ round: r + 1, phase: phases[i].phase, skill: phases[i].skill, result: res })
      if (!res) { trace.push({ round: r + 1, error: `phase ${phases[i].phase} died` }); break }
      if ((res.status || '').includes('blocked')) { trace.push({ round: r + 1, note: `chain stopped: ${phases[i].phase} blocked` }); break }
    }
    prevNote = `Round ${r + 1} completed. Driver notes: ${plan.notes}. Phases run: ${phases.map(p => p.phase).join(', ') || '(inline only)'}.`
  }
  return { key: s.key, trace }
}

const auditScenario = (run, s) => agent(`You are the audit analyst for one simulated AgentCorp pipeline run. Everything you need:
- Oracle: ${SIM}/${s.key}/hidden/oracle.md
- Focus defect classes: ${s.oracle_focus}
- The repo (inspect git log/diff/worktree): ${SIM}/${s.key}/repo/
- All pipeline artifacts: ${SIM}/${s.key}/teamspace/
- Harness trace summary (JSON): ${JSON.stringify(run.trace).slice(0, 12000)}
- Corpus contract map incl. known seams: ${R5}
- The skills' actual text: ${CORPUS}/agentcorp/<skill>/SKILL.md — read every skill implicated before blaming it.

Defect-class vocabulary: D1 should-trigger-didn't, D2 handoff contract mismatch, D3 role boundary violation, D4 gate/enum abuse, D5 process-weight miscalibration (BOTH directions — here going too LIGHT can be the defect), D6 missing honest-degrade, D7 evidence not consulted, D8 false-positive handling, D9 fabricated verification, D10 out-of-scope edits, D11 incomplete change, D12 iteration pathology; seam-<id>; new-<slug>.

Judge the PROCESS against the oracle. Attribute every failure to skill TEXT (file+section quote) and say whether the fix belongs in description/router, SKILL.md body, or cross-skill contract. Do NOT report harness artifacts as defects (auto-approved gates, batch-pre-written assignments, sequential execution of planned-parallel workers — but DO report partition overlaps in the PLAN itself). Distinguish model non-compliance with clear text (compliance-noise) from ambiguous/missing/conflicting text (real finding). Write the audit narrative (zh-CN) to ${SIM}/${s.key}/audit.md and return structured output.`, {
  label: `audit:${s.key}`, phase: 'Audit', schema: AUDIT_SCHEMA,
})

const results = await pipeline(
  SCENARIOS,
  (s) => buildStage(s),
  (built, s) => built ? executeScenario(s) : null,
  (run, s) => run ? auditScenario(run, s).then(a => ({ key: s.key, audit: a })) : null,
)

return { scenarios: (results || []).filter(Boolean) }
