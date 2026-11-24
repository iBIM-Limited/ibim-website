# Factory

This repo is worked on by coding agents. A ticket goes in, a reviewed pull request comes out, and
the code owner merges it. The rules agents follow are in [`AGENTS.md`](../AGENTS.md).

## Gates

| Gate | Enforced by |
|---|---|
| Ticket has acceptance criteria code can check | Intake, before any spec |
| Spec approved by the owner | Ticket status, before any code |
| Build and tests green | `ci` check (`.github/workflows/ci.yml`) |
| No deleted, renamed or skipped tests; test count not lower | `guard` check (`.github/workflows/guard.yml`) |
| Changed existing tests or rules files flagged | `guard` warnings, repeated in the handover |
| Rules files reviewed by the owner | `CODEOWNERS` |
| Independent review by a different model | Fresh reviewer thread that sees only ticket, spec and diff |
| Merge | The owner, by hand |

## Changing these rules

Only by a PR that the code owner reviews. Agents never edit their own rules directly.
