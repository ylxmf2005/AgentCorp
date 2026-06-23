# Contract testing reference

Use when performing contract verification on an API, JSON-RPC, A2A, CLI, SDK, or other external interface surface.

## Contract elements to check per interface surface

- **HTTP routes**: method, path, status code, headers, request body, response body, auth.
- **JSON-RPC / A2A**: method name, params, result/error shape, streaming behavior, protocol extensions.
- **CLI**: flags, arguments, exit codes, stdout/stderr shape, machine-readable output.
- **SDK / exported types**: function signatures, schemas, backward-compatible optional fields.
- **error contract**: status/code, body shape, retriability, user-visible message.

## Execution points

When an environment is available, run real requests or commands rather than inferring from code whether the contract is honored. Walk both the happy path and the contract-relevant error paths. Check actual responses against the TestPlan, docs, schema, or prior contract expectations one by one. Leave persistent data unchanged unless the TestPlan explicitly authorizes a change, or the environment itself is disposable. For interface surfaces that cannot be executed, explicitly record that they were not tested and why.

## Evidence to leave for each check

- The interface surface, and the version (if any).
- The request or command used.
- The expected status / shape / output.
- The actual status / shape / output.
- pass / fail.
- An artifact path when useful, or an inline redacted sample.

Never leak any secret in reports, logs, screenshots, or payloads.
