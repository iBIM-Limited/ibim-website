# Factory

This repo is worked on by coding agents. A ticket goes in, a reviewed pull request comes out, and
the code owner merges it. The rules agents follow are in [`AGENTS.md`](../AGENTS.md).

## Gates

| Gate | Enforced by |
|---|---|
| Ticket has acceptance criteria code can check | Intake, before any spec |
| Spec approved by the owner | Ticket status, before any code |
| Dependency audit, typecheck and build green | `ci` check |
| Every test runs and passes; none skipped; no fewer passing than on `main` | `ci` check, which runs the tests with a fixed command and reads the runner's own totals |
| No deleted or renamed test files, no skip/only/todo markers, no test files the runner would miss, assertion count not lower | `guard` check |
| PR targets `main`; checks re-run if the title or target changes | `guard`, `ci` and `codeql` triggers |
| Rules changes are announced: title must start with `Rules: ` | `guard` check |
| Changed existing tests or build/test scripts flagged | `guard` warnings, repeated in the handover |
| Static security scan | `codeql` check |
| Owner review of every change, approval reset by new commits | `CODEOWNERS` and the ruleset on `main` |
| Independent review by a different model | Fresh reviewer thread that sees only ticket, spec and diff |

## What the checks cannot do

- They cannot tell whether a test still checks the right thing. A changed existing test is only
  flagged, so the handover must say why it changed.
- They do not stop the agent account pressing merge after the owner has approved. That is a written
  rule in `AGENTS.md`, not something GitHub enforces here.
- A pull request runs its own copy of the workflow files. The checks stay trustworthy only while the
  agent account cannot push workflow files, which is why their logic is written inline in
  `.github/workflows/` and not in scripts.

## Changing these rules

Only by a PR that the code owner reviews, with a title starting `Rules: `. Agents never edit their
own rules directly. Workflow changes need the owner to allow the push for that one change.
