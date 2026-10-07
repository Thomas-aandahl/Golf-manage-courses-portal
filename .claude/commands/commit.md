---
description: Stage the current work and propose a Conventional Commit message
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git log:*)
---

1. Run `git status` and `git diff` (staged and unstaged) and `git log --oneline -5` for style.
2. If the changes cover more than one logical unit, propose a split into several commits and ask before committing.
3. Write a Conventional Commit message: `type(scope): summary` in imperative lowercase, max ~70 chars,
   with a short body explaining *why* when it is not obvious. Types: feat, fix, test, refactor, chore, docs, style, perf.
4. Show the message and the files, then commit only after the user confirms.

Extra instructions from the user: $ARGUMENTS
