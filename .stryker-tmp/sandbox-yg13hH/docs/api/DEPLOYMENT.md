# API Documentation Deployment

## Overview

The scoopdope API documentation can be deployed to GitHub Pages for public access.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Save

### 2. Create GitHub Actions Workflow

Due to OAuth token scope limitations, the workflow file must be created manually via GitHub UI or with a token that has `workflow` scope.

Create `.github/workflows/deploy-api-docs.yml`:

```yaml
name: Deploy API Documentation

on:
  push:
    branches:
      - main
    paths:
      - 'apps/backend/src/**'
      - 'docs/api/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build backend and export OpenAPI spec
        working-directory: apps/backend
        run: |
          npm run build
          npm run export:openapi
          mkdir -p ../../docs/api/dist
          cp dist/openapi.json ../../docs/api/dist/openapi.json

      - name: Copy Swagger UI
        run: cp docs/api/swagger-ui.html docs/api/dist/index.html

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'docs/api/dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Manual Deployment (Alternative)

If automated deployment isn't set up yet:

```bash
# Build backend and export OpenAPI spec
cd apps/backend
npm run build
npm run export:openapi

# Copy files to docs/api/dist
mkdir -p ../../docs/api/dist
cp dist/openapi.json ../../docs/api/dist/
cp ../api/swagger-ui.html ../../docs/api/dist/index.html

# Deploy to GitHub Pages (manual)
# Upload docs/api/dist contents to gh-pages branch
```

## Accessing Documentation

Once deployed, the API documentation will be available at:
- **Production**: https://nonso-eze.github.io/scoopdope/
- **Local**: http://localhost:3000/api/docs

## Updating Documentation

Documentation updates automatically when:
- Backend source code changes are pushed to main
- Swagger decorators are updated in controllers
- DTOs are modified

The workflow rebuilds and redeploys the OpenAPI spec on every relevant push.
