# Release Process

## Overview

This project uses [Release Please](https://github.com/googleapis/release-please) for automated semantic versioning and changelog generation based on conventional commits.

## How It Works

1. Developers commit using conventional commit format (enforced by commitlint)
2. Release Please analyzes commits since last release
3. Creates/updates a release PR with version bump and CHANGELOG
4. When PR is merged, creates a GitHub release and tags
5. Docker images are automatically tagged with the new version

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
npm run prepare  # Sets up husky hooks
```

### 2. Create Release Please Workflow

Due to OAuth token scope limitations, create `.github/workflows/release-please.yml` manually:

```yaml
name: Release Please

on:
  push:
    branches:
      - main

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          release-type: node
          package-name: scoopdope
          bump-minor-pre-major: true
          bump-patch-for-minor-pre-major: true
          
      # Build and tag Docker images if a release was created
      - name: Checkout
        if: ${{ steps.release.outputs.release_created }}
        uses: actions/checkout@v4
        
      - name: Set up Docker Buildx
        if: ${{ steps.release.outputs.release_created }}
        uses: docker/setup-buildx-action@v3
        
      - name: Login to Docker Hub
        if: ${{ steps.release.outputs.release_created }}
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          
      - name: Build and push backend image
        if: ${{ steps.release.outputs.release_created }}
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/backend/Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/scoopdope-backend:latest
            ${{ secrets.DOCKER_USERNAME }}/scoopdope-backend:${{ steps.release.outputs.major }}
            ${{ secrets.DOCKER_USERNAME }}/scoopdope-backend:${{ steps.release.outputs.major }}.${{ steps.release.outputs.minor }}
            ${{ secrets.DOCKER_USERNAME }}/scoopdope-backend:${{ steps.release.outputs.version }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 3. Configure Docker Hub Secrets

Add to repository secrets (Settings → Secrets and variables → Actions):
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub access token

## Commit Message Format

See [COMMIT_CONVENTIONS.md](./COMMIT_CONVENTIONS.md) for detailed commit format rules.

Quick reference:
```bash
feat(courses): add video upload support
fix(auth): prevent token refresh race condition
docs: update API documentation
```

## Version Bumping

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes (`feat!:` or `BREAKING CHANGE:`)
- **MINOR** (1.0.0 → 1.1.0): New features (`feat:`)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes (`fix:`)

## Release Workflow

1. Merge PRs with conventional commits to main
2. Release Please creates/updates a release PR
3. Review the generated CHANGELOG.md
4. Merge the release PR
5. Release Please creates a GitHub release with tag
6. Docker images are built and tagged automatically
7. Versions in package.json files are updated

## Manual Release (if needed)

```bash
# Create a release manually
git tag v1.2.3
git push origin v1.2.3

# Update CHANGELOG.md manually
# Update package.json versions manually
```

## References

- [Release Please Documentation](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
