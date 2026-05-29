# Accessibility Testing Guide

This document outlines the accessibility testing strategy for scoopdope, ensuring WCAG 2.1 AA compliance.

## Testing Framework

We use **axe-core** with **Playwright** for automated accessibility testing.

## Running Tests

### Local Testing

```bash
# Run all accessibility tests
npm run test:e2e -- e2e/accessibility.spec.ts --workspace=apps/frontend

# Run specific test suite
npm run test:e2e -- e2e/accessibility.spec.ts --grep "Keyboard Navigation"

# Run with headed browser for debugging
npm run test:e2e -- e2e/accessibility.spec.ts --headed
```

### CI/CD Pipeline

Accessibility tests run automatically on:
- Pull requests
- Pushes to main branch

Tests must pass before merging to main.

## Test Coverage

### 1. Automated Accessibility Violations
- Uses axe-core to detect WCAG violations
- Checks for:
  - Missing alt text
  - Color contrast issues
  - Missing form labels
  - Improper heading hierarchy
  - Missing ARIA attributes

### 2. Heading Hierarchy
- Ensures proper H1-H6 structure
- Prevents skipping heading levels
- Validates semantic meaning

### 3. Color Contrast
- Verifies WCAG AA contrast ratios (4.5:1 for text)
- Checks background/foreground color combinations

### 4. Image Alt Text
- Ensures all images have descriptive alt text
- Validates aria-label fallbacks

### 5. ARIA Labels
- Checks buttons have accessible names
- Validates form field associations
- Verifies landmark regions

### 6. Keyboard Navigation
- Tests Tab key navigation
- Validates focus indicators
- Tests Enter key on buttons
- Tests Escape key for modals

### 7. Screen Reader Compatibility
- Validates semantic HTML usage
- Checks form label associations
- Verifies live regions for dynamic content
- Validates link text descriptiveness

### 8. Form Accessibility
- Ensures inputs have associated labels
- Validates error message accessibility
- Checks required field indicators

### 9. Mobile Accessibility
- Validates touch target sizes (44x44px minimum)
- Checks responsive design without horizontal scroll

## Common Issues & Fixes

### Missing Alt Text
```html
<!-- ❌ Bad -->
<img src="course.jpg" />

<!-- ✅ Good -->
<img src="course.jpg" alt="Introduction to Stellar blockchain course" />
```

### Poor Color Contrast
```css
/* ❌ Bad - insufficient contrast */
color: #999;
background: #f5f5f5;

/* ✅ Good - 4.5:1 contrast ratio */
color: #333;
background: #fff;
```

### Missing Form Labels
```html
<!-- ❌ Bad -->
<input type="email" placeholder="Email" />

<!-- ✅ Good -->
<label for="email">Email</label>
<input id="email" type="email" />
```

### Improper Heading Hierarchy
```html
<!-- ❌ Bad - skips H2 -->
<h1>Course</h1>
<h3>Module</h3>

<!-- ✅ Good -->
<h1>Course</h1>
<h2>Module</h2>
```

### Missing Focus Indicators
```css
/* ❌ Bad - removes focus */
button:focus {
  outline: none;
}

/* ✅ Good - visible focus */
button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

## Accessibility Checklist

- [ ] All images have descriptive alt text
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Heading hierarchy is proper (H1-H6)
- [ ] All form inputs have labels
- [ ] Buttons have accessible names
- [ ] Focus indicators are visible
- [ ] Keyboard navigation works
- [ ] No keyboard traps
- [ ] Semantic HTML is used
- [ ] ARIA attributes are correct
- [ ] Touch targets are 44x44px minimum
- [ ] No horizontal scroll on mobile
- [ ] Error messages are accessible
- [ ] Live regions announce changes
- [ ] Links have descriptive text

## Tools & Resources

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Learning Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

### Keyboard Shortcuts
- `Tab` - Navigate forward
- `Shift + Tab` - Navigate backward
- `Enter` - Activate button/link
- `Space` - Toggle checkbox/button
- `Escape` - Close modal/menu
- `Arrow Keys` - Navigate within components

## Continuous Improvement

1. **Regular Audits**: Run accessibility audits monthly
2. **User Testing**: Include users with disabilities in testing
3. **Training**: Keep team updated on accessibility best practices
4. **Monitoring**: Track accessibility metrics over time

## Reporting Issues

If you find accessibility issues:

1. Document the issue with:
   - Page/component affected
   - WCAG criterion violated
   - Steps to reproduce
   - Expected behavior

2. Create an issue with label `accessibility`

3. Include:
   - Screenshot/video
   - Browser/assistive technology used
   - Severity level

## References

- [WCAG 2.1 Specification](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Playwright Testing](https://playwright.dev/)
