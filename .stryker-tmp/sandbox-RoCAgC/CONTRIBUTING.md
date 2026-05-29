# Contributing to scoopdope

Thank you for your interest in contributing to scoopdope! We welcome contributions from the community to help make blockchain education accessible to everyone.

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code. Please report unacceptable behaviour to the maintainers.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally: `git clone https://github.com/<your-username>/scoopdope.git`
3. **Follow the [Developer Setup Guide](docs/development-setup.md)** to set up your environment.
4. **Create a new branch** from `main` for your change (see naming conventions below).
5. Make your changes, add tests, and open a pull request.

## Branch Naming Conventions

| Prefix | When to use |
|--------|-------------|
| `feat/` | New feature — e.g. `feat/api-key-rotation` |
| `fix/` | Bug fix — e.g. `fix/xss-sanitization` |
| `docs/` | Documentation only — e.g. `docs/contract-guide` |
| `chore/` | Maintenance, tooling, deps — e.g. `chore/upgrade-nestjs` |
| `refactor/` | Code restructure with no behaviour change |
| `test/` | Adding or fixing tests |

Branch names must be lowercase and use hyphens, not underscores.

## Commit Message Format (Conventional Commits)

We enforce [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) via `commitlint`. Every commit message must follow this structure:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons — no logic change |
| `refactor` | Code change that is neither a fix nor a feature |
| `test` | Adding or correcting tests |
| `chore` | Build process, dependency updates, tooling |
| `perf` | Performance improvement |
| `ci` | CI/CD configuration changes |

### Scope (optional but encouraged)

Use the affected module: `auth`, `courses`, `users`, `stellar`, `contracts`, `frontend`, `docs`, etc.

### Examples

```
feat(auth): add API key authentication for service-to-service calls
fix(courses): strip HTML from description before saving
docs(contracts): add end-to-end credential issuance flow
chore(deps): upgrade @stellar/stellar-sdk to v13
```

Breaking changes must include `BREAKING CHANGE:` in the footer:

```
feat(auth)!: remove legacy /v0 endpoints

BREAKING CHANGE: All clients must migrate to /v1 endpoints.
```

## Pull Request Process

1. **Keep PRs small and focused** — one logical change per PR.
2. **Fill in the PR template** completely.
3. **Ensure all CI checks pass** before requesting review.
4. **Link the related issue** using `Closes #<issue-number>` in the PR description.
5. **Request at least one review** from a maintainer.
6. **Address all review comments** before merging.
7. PRs are merged via **squash merge** to keep a clean history.

## Review Checklist

Before submitting your PR, verify:

- [ ] Code follows the style guide (`npm run lint` passes).
- [ ] All existing tests pass (`npm run test`).
- [ ] New tests are added for new behaviour.
- [ ] Commits follow Conventional Commits format.
- [ ] Documentation is updated if behaviour changes.
- [ ] No secrets or PII are committed.
- [ ] PR description clearly explains the *what* and *why*.

## Development Workflow

```bash
# Install dependencies
npm install

# Run backend in watch mode
npm run dev:backend

# Run tests
cd apps/backend && npm test

# Lint
npm run lint
```

See [docs/development-setup.md](docs/development-setup.md) for the full setup guide.

## Security

If you discover a security vulnerability, **do not open a public issue**. Follow our [Security Policy](SECURITY.md) for responsible disclosure.

## API Versioning

All REST endpoints are prefixed with `/v1`. Before introducing any breaking change you **must** follow the process in [docs/api-versioning.md](docs/api-versioning.md). In short:

1. Implement the change under a new prefix (`/v2/...`) — never modify `/v1` in place.
2. Mark the old endpoint deprecated in Swagger (`@ApiOperation({ deprecated: true })`).
3. Add `Deprecation` and `Sunset` response headers to the old endpoint.
4. Use a `feat!:` or `BREAKING CHANGE:` commit so Release Please bumps the major version.
5. Keep both versions running for **at least 90 days** before removing `/v1`.

See [docs/api-versioning.md](docs/api-versioning.md) for the full strategy, deprecation timeline, and migration examples.
