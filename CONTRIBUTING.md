# Contributing

Thanks for your interest in contributing! This guide covers branch naming, commit message conventions, and the pull request process.

## Branch naming

Create a branch off `main` using a short, descriptive name prefixed by the type of change:

- `feat/<short-description>` — new feature
- `fix/<short-description>` — bug fix
- `docs/<short-description>` — documentation only
- `refactor/<short-description>` — code change that neither fixes a bug nor adds a feature
- `test/<short-description>` — adding or updating tests
- `chore/<short-description>` — tooling, build, or maintenance work

Use lowercase words separated by hyphens, and reference the issue number when one exists, e.g. `fix/1069-contributing-guide`.

## Commit message conventions

This repository follows [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should have the form:

```
<type>(<optional scope>): <short summary>

<optional body>

<optional footer>
```

Common types:

- `feat` — a new feature
- `fix` — a bug fix
- `docs` — documentation changes
- `refactor` — a code change that neither fixes a bug nor adds a feature
- `test` — adding or updating tests
- `chore` — tooling, build, or maintenance work

Guidelines:

- Keep the summary in the imperative mood and under ~72 characters (e.g. `fix: handle empty response body`).
- Use the body to explain *what* and *why*, not *how*.
- Reference issues in the footer, e.g. `Closes #1069`.
- Keep each commit focused on a single logical change.

## Pull request process

1. Fork the repository and create your branch from `main` using the naming convention above.
2. Make your changes, keeping commits focused and following the commit conventions.
3. Ensure the project builds and any relevant tests pass locally.
4. Open a pull request against `main` with a clear title and description.
   - Describe the problem and the approach taken.
   - Link the related issue(s) (e.g. `Closes #1069`).
   - Include screenshots or logs when they help reviewers.
5. Keep the pull request scoped to a single concern; split unrelated changes into separate PRs.
6. Address review feedback by pushing additional commits to the same branch.
7. Once approved and CI is green, a maintainer will merge the pull request.

## Questions

If anything here is unclear, open an issue and we'll be happy to help.
