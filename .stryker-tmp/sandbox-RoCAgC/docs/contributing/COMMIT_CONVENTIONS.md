# Commit Message Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for automated semantic versioning and changelog generation.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- **feat**: A new feature (triggers MINOR version bump)
- **fix**: A bug fix (triggers PATCH version bump)
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code changes that neither fix bugs nor add features
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI/CD configuration
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Breaking Changes

Add `BREAKING CHANGE:` in the footer or `!` after type to trigger MAJOR version bump:

```
feat!: remove deprecated API endpoints

BREAKING CHANGE: /auth/legacy endpoint has been removed
```

## Examples

### Feature
```
feat(courses): add video upload support

Implement video upload endpoint with S3 integration
```

### Bug Fix
```
fix(auth): prevent token refresh race condition

Add mutex lock to refresh token validation
```

### Documentation
```
docs: update API authentication examples

Add curl examples for all auth endpoints
```

### Breaking Change
```
feat(api)!: migrate to v2 API structure

BREAKING CHANGE: All endpoints now require /v2 prefix
```

## Scope

Optional but recommended. Common scopes:
- `auth`, `courses`, `users`, `stellar`, `contracts`
- `frontend`, `backend`, `ci`, `docker`

## Enforcement

Commits are validated using commitlint via husky pre-commit hook. Invalid commits will be rejected.

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Release Please](https://github.com/googleapis/release-please)
