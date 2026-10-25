---
name: auto-commit
description: Commit git changes with generated Conventional Commits messages, as checkpoint commits during a task and again before reporting done. Use proactively and without being asked at each coherent unit of work (fix complete, tests passing, feature increment finished), before starting a risky refactor, and whenever the user says "commit this", "auto commit", "save my work", "commit and push", or "check in changes". Optionally pushes to the current upstream. Never force-pushes, never amends pushed commits, and refuses to commit likely secrets.
argument-hint: "[optional scope, e.g. 'app/' or 'and push']"
allowed-tools: Bash, Read, Grep, Glob
---

# Auto-commit changed work

Commit changed work with a message that describes the diff — no interactive prompts,
no guessing about intent. Commit **as you go**, not just at the end.

## When this runs

**During the task, at every checkpoint.** This is the primary mode. As soon as a unit
of work reaches a coherent, working state, commit it and move on — do not wait until the
whole task is finished. Then check again before writing your final summary.

A `Stop` hook used to backstop this skill; it has been removed. This skill is now the
only thing that commits — see "No automatic backstop" below.

## Checkpoints — commit at these moments

| Checkpoint | Commit because |
| --- | --- |
| A fix works and tests/typecheck pass | The change is verifiably correct now; later edits could break it |
| Each independent feature increment is finished | Keeps unrelated work separable and reviewable |
| Dependencies, lockfiles, or build config changed | Easy to forget, and painful to untangle later |
| **Before** starting a risky refactor or large rewrite | The green state is your rollback point |
| You are about to touch a different, unrelated concern | Mixing concerns in one commit ruins `git bisect` and revert |
| The task is long and context is filling up | Uncommitted work is one crash away from gone |
| Before reporting the task complete | Final safety net; never end a task with a dirty tree |

## When NOT to commit

- Tests or the build are **failing** — never checkpoint a broken state
- You are **mid-refactor** with broken imports or half-migrated call sites
- You are still **exploring** and may revert everything (use a scratch branch instead)
- The user said not to commit, or the change hits a "Refuse to commit" rule

## Commit granularity

One logical change per commit. If the working tree holds several unrelated changes,
commit them **separately**, each with its own message — stage explicit paths rather
than everything at once:

```bash
git add app/cart.ts && git commit -m "fix(app): handle empty cart"
git add package.json pnpm-lock.yaml && git commit -m "build: add zod"
```

Do not fold a bug fix, a dependency bump, and a formatting pass into one commit.

## Workflow

1. **Verify this is a repo with changes.**

   ```bash
   git rev-parse --show-toplevel && git status --porcelain
   ```

   If the output is empty, stop and report "working tree clean — nothing to commit."
   Do not create an empty commit.

2. **Read the diff before writing the message.** Never commit code you have not looked at.

   ```bash
   git diff --stat && git diff          # unstaged, tracked
   git diff --cached --stat             # already staged
   git status --porcelain               # untracked files
   ```

   If the diff contains credentials, keys, tokens, `.env` files, or large binaries,
   stop and ask the user before proceeding. See "Refuse to commit" below.

3. **Write the commit message.** One line, Conventional Commits, imperative mood,
   <= 72 chars. Pick the type from the actual change:

   | Type | Use for |
   | --- | --- |
   | `feat` | new user-visible capability |
   | `fix` | bug fix |
   | `refactor` | behavior-preserving restructuring |
   | `perf` | speed/memory improvement |
   | `docs` | comments, README, docs only |
   | `test` | tests only |
   | `build` | deps, lockfiles, tooling config |
   | `chore` | anything else (formatting, gitignore) |
   | `style` | whitespace/formatting with no logic change |

   Add a scope when the change is confined to one area, e.g. `fix(app): handle empty cart`.
   If the diff spans unrelated concerns, split it into separate commits (see above) rather
   than writing one vague message.

4. **Stage, then commit.** Stage everything git should track, new files included —
   `git add -A` respects `.gitignore`, so `node_modules/`, build output, and `.env` files
   listed there stay out. Use explicit paths when you want a focused commit.

   ```bash
   git add -A                                   # all changes, new files included
   git add <path>                               # or explicit paths for a focused commit
   git diff --cached --stat                     # confirm exactly what will be committed
   git commit -m "fix(app): handle empty cart"
   ```

5. **Push only if the user asked.** Never force-push.

   ```bash
   git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1 \
     && git push \
     || git push -u origin "$(git branch --show-current)"
   ```

6. **Report** the short SHA, the message, and the file count:

   ```bash
   git log -1 --stat --oneline
   ```

## Refuse to commit

Stop and ask the user if any of these appear in the staged set:

- `.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa*`, `credentials*`, `secrets*`, `*.p12`, `.npmrc`, `.netrc`
- API keys / tokens / private key blocks in the diff (`AKIA`, `ghp_`, `sk-`, `-----BEGIN ... PRIVATE KEY-----`)
- Files over ~5 MB, or `node_modules/`, build output, `dist/`, `.next/` that are not gitignored

Also never: `git push --force`, `git commit --amend` on a commit already pushed,
`git reset --hard`, or `git clean`. If a pre-commit hook fails, report the failure
and fix the cause — do not use `--no-verify`.

## No automatic backstop

There is no hook and no other safety net. Nothing is committed unless this skill runs, so
never end a task assuming something else will save the work. Always check for uncommitted
changes yourself before reporting the task complete — an uncommitted tree is a failure
mode of this workflow, not a neutral state.
