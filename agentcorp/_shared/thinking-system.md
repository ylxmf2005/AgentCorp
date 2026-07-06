# Thinking System Protocol

Use this reference when routing or handing off among `probe`, `brainstorm`, `grill`, `explain`, and `walkthrough`.

## Five Moves

- `probe` converts hidden uncertainty into named uncertainty: unknown unknown -> known unknown.
- `brainstorm` converts unclear intent into selectable requirements or direction.
- `grill` converts a chosen shape into a harder-to-fool shape.
- `explain` converts an unclear piece of knowledge, report, excerpt, or output into context-aware understanding.
- `walkthrough` converts a concrete code change into teachable understanding.

## Knowledge Matrix

Use a Rumsfeld/Johari-style matrix when uncertainty matters:

| Category | Meaning | What to do |
| --- | --- | --- |
| known known | We know it and can cite evidence. | Use it directly; explain it if needed. |
| known unknown | We know what is missing. | Ask, inspect, research, or test. |
| unknown known | The knowledge exists somewhere but is not in the current frame. | Search prior artifacts, learnings, docs, code, logs, or user history. |
| unknown unknown | We have not named the missing frame yet. | Probe with lenses until it becomes a known unknown. |

Do not let an unknown remain poetic. Convert it into one of:

- `ask_user`: a question only the sponsor can answer.
- `inspect_repo`: file, test, doc, or behavior to inspect.
- `inspect_history`: prior task, learning, decision, incident, review, or artifact to search.
- `research_external`: current or third-party fact to verify.
- `experiment`: cheap reproduction, spike, or measurement.
- `accept_assumption`: explicit assumption with risk owner and revisit point.

## Handoff Shape

When handing off between these skills, preserve:

- source request or artifact
- knowledge matrix entries that matter
- evidence already checked
- unresolved known unknowns with a resolution path
- recommendation for the next move

The next move should be one of: `probe`, `brainstorm`, `grill`, `explain`, `walkthrough`, `parallel-researcher`, or the normal AgentCorp delivery role.
