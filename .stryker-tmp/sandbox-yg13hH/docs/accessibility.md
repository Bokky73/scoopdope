# Accessibility (a11y) Guidelines

scoopdope targets **WCAG 2.1 Level AA** compliance. This document covers testing procedures, keyboard navigation requirements, screen reader support, ARIA usage patterns drawn from the existing codebase, and the PR checklist every contributor must complete.

---

## Table of Contents

1. [Accessibility Testing with @axe-core/react](#accessibility-testing-with-axe-corereact)
2. [Keyboard Navigation Requirements](#keyboard-navigation-requirements)
3. [Screen Reader Testing Procedures](#screen-reader-testing-procedures)
4. [ARIA Usage Patterns](#aria-usage-patterns)
5. [Accessibility Checklist for PRs](#accessibility-checklist-for-prs)

---

## Accessibility Testing with @axe-core/react

`@axe-core/react` is already installed as a dev dependency. It runs the axe accessibility engine against rendered React components and reports violations.

### Unit Tests (vitest + @testing-library/react)

Integrate axe into component tests using `vitest-axe` or the `axe-core` API directly. Add it alongside existing `@testing-library/react` tests:

```typescript
// apps/frontend/src/__tests__/components/Button.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';
import { Button } from '@/components/ui/Button';

expect.extend(toHaveNoViolations);

it('has no axe violations', async () => {
  const { container } = render(<Button>Submit</Button>);
  expect(await axe(container)).toHaveNoViolations();
});
```

Install the required helper:

```bash
npm install --save-dev jest-axe @types/jest-axe --workspace=apps/frontend
```

### Development Mode Overlay

To surface violations in the browser during development, enable the `@axe-core/react` overlay in `apps/frontend/src/app/layout.tsx`:

```typescript
// Only runs in development — zero production cost
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then(({ default: axe }) => {
    axe(React, ReactDOM, 1000);
  });
}
```

Violations appear in the browser DevTools console with WCAG rule references.

### E2E Tests (Playwright)

Use `@axe-core/playwright` to run full-page axe scans in e2e tests:

```bash
npm install --save-dev @axe-core/playwright --workspace=apps/frontend
```

```typescript
// apps/frontend/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('courses page has no critical a11y violations', async ({ page }) => {
  await page.goto('/courses');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

---

## Keyboard Navigation Requirements

All interactive elements must be fully operable via keyboard alone (WCAG 2.1 SC 2.1.1).

### Focus Management

- Every interactive element must receive a visible focus indicator. scoopdope uses `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2` on `Button` and `Input`. Apply the same to any new interactive element:

```typescript
// Tailwind classes required on all focusable elements
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
```

- Never use `outline: none` or `outline: 0` without providing an equivalent custom focus style.

### Tab Order

- The natural DOM order must match the visual reading order. Avoid positive `tabindex` values — they break the natural tab sequence.
- Use `tabindex="0"` only to make a non-interactive element focusable when necessary.
- Use `tabindex="-1"` to manage programmatic focus (e.g. moving focus into a modal on open).

### Modal Focus Trap

When a `Modal` opens, focus must be trapped inside it and returned to the trigger element on close:

```typescript
// Modal open: move focus to the modal container
useEffect(() => {
  if (isOpen) {
    modalRef.current?.focus();
  }
}, [isOpen]);

// Modal close: return focus to the element that opened it
const triggerRef = useRef<HTMLButtonElement>(null);
const handleClose = () => {
  onClose();
  triggerRef.current?.focus();
};
```

### Keyboard Interaction Patterns

| Component | Key | Expected behaviour |
|---|---|---|
| Button | `Enter` / `Space` | Activates the button |
| Link | `Enter` | Follows the link |
| Modal | `Escape` | Closes the modal |
| Dropdown menu | `Arrow Up/Down` | Moves between menu items |
| Dropdown menu | `Escape` | Closes the menu, returns focus to trigger |
| Select | `Arrow Up/Down` | Changes selected option |
| Navbar hamburger | `Enter` / `Space` | Toggles mobile menu open/closed |

---

## Screen Reader Testing Procedures

### Recommended Screen Readers

| Platform | Screen reader | Browser |
|---|---|---|
| macOS | VoiceOver (built-in) | Safari |
| Windows | NVDA (free) | Firefox or Chrome |
| Windows | JAWS | Chrome or Edge |
| iOS | VoiceOver (built-in) | Safari |
| Android | TalkBack (built-in) | Chrome |

Minimum requirement: test with **VoiceOver + Safari** and **NVDA + Firefox** before merging any UI change.

### Testing Procedure

1. Enable the screen reader and navigate to the changed page.
2. Use `Tab` to move through interactive elements — confirm each has a meaningful announced name.
3. Use the screen reader's heading navigation (`H` in NVDA/VoiceOver) — confirm heading hierarchy is logical (one `h1` per page, no skipped levels).
4. Activate form controls — confirm labels are announced, errors are announced on submission, and `aria-invalid` state is read.
5. Open any modals or dialogs — confirm focus moves into the dialog and is trapped.
6. Confirm dynamic content updates (toasts, progress changes) are announced via live regions.

### Live Regions

Use `role="alert"` (assertive) for errors and `role="status"` (polite) for non-critical updates:

```typescript
// Error — announced immediately (already used in Input component)
<p id={`${inputId}-error`} role="alert" className="text-xs text-red-600">
  {error}
</p>

// Status — announced when the screen reader is idle
<p role="status" aria-live="polite">
  Progress saved.
</p>
```

---

## ARIA Usage Patterns

The following patterns are established in the scoopdope codebase. Follow them consistently.

### `aria-current="page"` — Active Navigation Link

Mark the currently active route in the Navbar:

```typescript
// Navbar.tsx
<Link
  href="/courses"
  aria-current={isActive('/courses') ? 'page' : undefined}
>
  Courses
</Link>
```

Never set `aria-current="false"` — omit the attribute entirely when the link is not current.

### `aria-label` — Buttons Without Visible Text

Icon-only buttons and buttons whose visible label is ambiguous must have an `aria-label`:

```typescript
// Modal close button
<button onClick={onClose} aria-label="Close modal">✕</button>

// Navbar hamburger
<button aria-label="Open menu">☰</button>
<button aria-label="Close menu">✕</button>

// Navbar user menu
<button aria-label="User menu">
  <Avatar />
</button>
```

### `aria-invalid` + `aria-describedby` — Form Validation

The `Input` component already implements this pattern. Replicate it for any new form field:

```typescript
<input
  aria-invalid={!!error}
  aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
/>
{error && <p id={`${id}-error`} role="alert">{error}</p>}
{!error && helperText && <p id={`${id}-helper`}>{helperText}</p>}
```

### `role="progressbar"` — Progress Indicators

The `ProgressBar` component uses the full ARIA progressbar pattern:

```typescript
<div
  role="progressbar"
  aria-valuenow={value}   // current value (0–100)
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={label ?? 'Progress'}
>
```

Always provide `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and either `aria-label` or `aria-labelledby`.

### `aria-label` on Landmark Regions

Named landmarks help screen reader users jump between sections:

```typescript
// Navbar already uses this
<nav aria-label="Site navigation">

// Use for secondary navs, e.g. breadcrumbs
<nav aria-label="Breadcrumb">

// Main content area
<main aria-label="Main content">
```

### `role="menuitem"` — Dropdown Menus

Dropdown menus (e.g. the Navbar user menu) must use the ARIA menu pattern:

```typescript
<div role="menu" aria-label="User options">
  <button role="menuitem">Profile</button>
  <button role="menuitem">Logout</button>
</div>
```

### What to Avoid

| Pattern | Problem | Alternative |
|---|---|---|
| `<div onClick={...}>` | Not keyboard accessible, no role | Use `<button>` |
| `aria-label` on a `<div>` with no role | Label has no semantic target | Add an appropriate `role` |
| Positive `tabindex` | Breaks natural tab order | Use `tabindex="0"` or `tabindex="-1"` only |
| `placeholder` as the only label | Disappears on input, not reliably announced | Always use a visible `<label>` |
| `title` attribute as the only accessible name | Inconsistent screen reader support | Use `aria-label` |

---

## Accessibility Checklist for PRs

Copy this checklist into your PR description for any change that touches UI components, pages, or forms.

```markdown
## Accessibility Checklist

### Automated
- [ ] `axe` scan passes with no WCAG 2.1 AA violations (unit test or dev overlay)
- [ ] No new `eslint-plugin-jsx-a11y` errors introduced

### Keyboard
- [ ] All new interactive elements are reachable and operable via keyboard alone
- [ ] Focus indicator is visible on all focusable elements (`focus-visible:ring-2`)
- [ ] Tab order follows the visual reading order
- [ ] Modals/dialogs trap focus and return it to the trigger on close
- [ ] Escape key closes modals, dropdowns, and overlays

### Screen Reader
- [ ] Tested with VoiceOver (macOS/Safari) or NVDA (Windows/Firefox)
- [ ] All interactive elements have a meaningful accessible name
- [ ] Page has a single `<h1>` and logical heading hierarchy (no skipped levels)
- [ ] Form errors are announced via `role="alert"` and `aria-invalid`
- [ ] Dynamic updates use appropriate live regions (`role="alert"` or `role="status"`)

### ARIA
- [ ] `aria-current="page"` applied to the active navigation link
- [ ] Icon-only buttons have `aria-label`
- [ ] `role="progressbar"` includes `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- [ ] No ARIA roles or attributes are used incorrectly (e.g. `aria-label` on a `<div>` without a role)
- [ ] Landmark regions are labelled where multiple of the same type exist on a page

### Images & Media
- [ ] All `<img>` and `<Image>` elements have descriptive `alt` text (or `alt=""` for decorative images)
- [ ] Videos have captions or transcripts
```

---

## Related Docs

- [development-setup.md](./development-setup.md) — Local environment setup
- [contributing/COMMIT_CONVENTIONS.md](./contributing/COMMIT_CONVENTIONS.md) — Commit message format

## External References

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
- [Testing Library — Queries by Role](https://testing-library.com/docs/queries/byrole)
