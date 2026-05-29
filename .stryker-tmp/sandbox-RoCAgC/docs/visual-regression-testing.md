# Visual Regression Testing Guide

This guide explains how to set up and run visual regression tests for the scoopdope frontend.

## Overview

Visual regression testing automatically detects unintended UI changes by comparing screenshots across versions. We use two complementary tools:

1. **Chromatic** - Component-level visual testing via Storybook
2. **Percy** - Full application visual testing via Playwright

## Tools

### Chromatic

Chromatic integrates with Storybook to test individual components in isolation.

**Features:**
- Component snapshot testing
- Automatic baseline creation
- Visual diff review in PRs
- Accessibility checks

**Setup:**
```bash
# Already configured in .github/workflows/ci.yml
# Requires CHROMATIC_PROJECT_TOKEN secret
```

**Running Locally:**
```bash
npm run build-storybook --workspace=apps/frontend
npx chromatic --project-token=<YOUR_TOKEN>
```

### Percy

Percy captures full-page screenshots of the running application for comprehensive visual testing.

**Features:**
- Full-page visual regression detection
- Responsive design testing (mobile, tablet, desktop)
- Dark mode testing
- Component interaction testing
- Visual diff review in PRs

**Setup:**
```bash
# Install Percy CLI
npm install -g @percy/cli

# Set token
export PERCY_TOKEN=<YOUR_TOKEN>
```

## Running Visual Tests

### Locally

#### Chromatic (Component Testing)
```bash
# Build Storybook
npm run build-storybook --workspace=apps/frontend

# Run Chromatic
npx chromatic --project-token=<YOUR_TOKEN>
```

#### Percy (Full Application Testing)
```bash
# Start backend
npm run dev:backend

# In another terminal, run visual tests
cd apps/frontend
npx playwright test --config=playwright-visual.config.ts
```

### In CI/CD

Visual tests run automatically on:
- Pull requests
- Pushes to main branch

**Chromatic:**
- Runs on every PR and main push
- Creates visual diffs for review
- Blocks merge if critical changes detected

**Percy:**
- Runs on every PR and main push
- Captures full-page screenshots
- Compares against baseline
- Uploads results to Percy dashboard

## Test Coverage

### Pages Tested

1. **Dashboard**
   - Full page layout
   - Responsive layouts (mobile, tablet, desktop)
   - Dark mode variant
   - Header and navigation

2. **Courses**
   - Course listing page
   - Course detail page
   - Enrollment modal
   - Dark mode variant

3. **User Profile**
   - Profile page layout
   - Achievements section
   - Credentials section
   - Dark mode variant

4. **Authentication**
   - Login page
   - Signup page
   - Error states
   - Form validation

5. **Components**
   - Button states
   - Form inputs
   - Modals and dialogs
   - Notifications and alerts

### Responsive Breakpoints

Tests cover three viewport sizes:
- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1920x1080 (Full HD)

### Color Schemes

Tests include:
- Light mode (default)
- Dark mode (emulated)

## Reviewing Visual Changes

### In GitHub PR

1. **Chromatic Review**
   - Check the Chromatic status check
   - Click "Review changes" to see visual diffs
   - Approve or request changes

2. **Percy Review**
   - Check the Percy status check
   - Click "Review changes" to see full-page diffs
   - Approve or request changes

### Interpreting Diffs

- **Green**: No changes detected
- **Yellow**: Minor changes (review recommended)
- **Red**: Significant changes (review required)

## Updating Baselines

### Chromatic

Baselines are automatically updated when you accept changes in the Chromatic UI.

### Percy

Baselines are automatically updated on main branch after approval.

To manually update:
```bash
# Run tests and approve changes
npx playwright test --config=playwright-visual.config.ts --update-snapshots
```

## Masking Dynamic Content

Some elements change on every run (timestamps, IDs, etc.). Mask them to avoid false positives:

```typescript
await expect(page).toHaveScreenshot('page.png', {
  mask: [page.locator('[data-testid="dynamic-content"]')],
});
```

## Troubleshooting

### Tests Fail Locally but Pass in CI

**Cause**: Different fonts, rendering engines, or OS differences

**Solution**:
- Use Docker for consistent environment
- Run in CI environment
- Check browser versions

### False Positives

**Cause**: Dynamic content, animations, or timing issues

**Solution**:
- Add masks for dynamic elements
- Wait for animations to complete
- Use `waitForLoadState('networkidle')`

### Baseline Drift

**Cause**: Intentional design changes not approved

**Solution**:
- Review and approve changes in Percy/Chromatic
- Update baselines after approval
- Document design changes in PR

## Best Practices

1. **Keep Tests Focused**
   - Test one component or page per test
   - Avoid testing multiple states in one screenshot

2. **Wait for Content**
   - Use `waitForLoadState('networkidle')`
   - Wait for animations to complete
   - Wait for images to load

3. **Mask Dynamic Content**
   - Mask timestamps, IDs, random content
   - Mask user-generated content
   - Mask external API responses

4. **Review Changes Carefully**
   - Always review visual diffs
   - Understand why changes occurred
   - Approve intentional changes only

5. **Keep Baselines Updated**
   - Update baselines after design changes
   - Document baseline updates in commits
   - Avoid accumulating drift

## CI/CD Configuration

### Required Secrets

- `CHROMATIC_PROJECT_TOKEN` - Chromatic project token
- `PERCY_TOKEN` - Percy project token

### Workflow Files

- `.github/workflows/ci.yml` - Main CI workflow with visual tests
- `apps/frontend/playwright-visual.config.ts` - Playwright visual test config
- `apps/frontend/e2e/visual-regression.spec.ts` - Visual regression test specs

## References

- [Chromatic Documentation](https://www.chromatic.com/docs)
- [Percy Documentation](https://docs.percy.io)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Visual Regression Testing Best Practices](https://www.smashingmagazine.com/2021/07/visual-regression-testing/)
