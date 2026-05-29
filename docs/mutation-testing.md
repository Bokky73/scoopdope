# Mutation Testing Guide

## Overview

Mutation testing verifies test quality by introducing small code changes (mutations) and checking if tests catch them. This ensures tests are effective at detecting bugs.

Mutation testing is a powerful quality metric that complements code coverage by measuring how well tests actually validate the code's behavior.

## Setup

Mutation testing is configured using Stryker with the following setup:

- **Test Runner**: Jest
- **Target**: Backend (`apps/backend/src/**/*.ts`)
- **Mutator**: TypeScript (all mutations except test files, index files, and modules)
- **Reporters**: HTML, Clear Text, and Progress

## Running Mutation Tests

### Full mutation test suite

```bash
npm run test:mutation
```

This command:
1. Instruments all backend source files with mutations
2. Runs the test suite for each mutation
3. Generates reports in `coverage/mutation/`

### Generate HTML report

```bash
npm run test:mutation:report
```

The HTML report will be available at `coverage/mutation/index.html`

## Configuration

The Stryker configuration is in [stryker.conf.js](../stryker.conf.js) with:

- **Mutate**: All TypeScript files in `apps/backend/src`
- **Exclude**: Test files (*.spec.ts, *.test.ts), index files, and module definitions
- **Timeout**: 5 seconds per mutation test run
- **Concurrency**: 2 parallel test runners for optimal performance

## Mutation Results Explained

- **Killed**: Mutation was caught by tests (good) ✅
- **Survived**: Mutation was not caught (test gap) ⚠️
- **Timeout**: Mutation caused infinite loop or excessive runtime ⏱️
- **Compile Error**: Mutation caused syntax error (excluded) ❌
- **No Coverage**: Mutation in uncovered code

### Mutation Score Interpretation

- **70%+**: Excellent test coverage (target threshold)
- **60-70%**: Good test coverage, minor gaps
- **40-60%**: Acceptable, but significant gaps exist
- **<40%**: Poor test coverage, needs improvement

## Best Practices

1. **Target Critical Modules First**: Focus on business logic and security-sensitive code:
   - Authentication & authorization modules
   - Payment processing logic
   - Stellar blockchain interactions
   - Data validation

2. **Improve Weak Tests**: High survival rates indicate:
   - Insufficient edge case testing
   - Missing boundary condition tests
   - Lack of error path validation
   - Add more specific assertions

3. **Iterative Improvement**: 
   - Run mutation tests after implementing new features
   - Fix test gaps before committing
   - Track mutation scores over time

4. **CI Integration**: Add mutation tests to CI/CD for critical modules:
   ```bash
   npm run test:mutation
   ```

## Examples

### Example 1: Authentication Logic Gap

If mutation testing shows high survival in `auth/auth.service.ts`:

```typescript
// Original code
if (user && user.isActive) {
  return generateToken(user);
}
```

A mutation like this might survive:
```typescript
if (user || user.isActive) { // Changed && to ||
  return generateToken(user);
}
```

**Fix**: Add a test case:
```typescript
it('should not generate token for inactive users', () => {
  const inactiveUser = { id: 1, isActive: false };
  expect(authService.generateToken(inactiveUser)).toBeNull();
});
```

### Example 2: Validation Logic

Original code:
```typescript
if (amount > 0 && amount < MAX_AMOUNT) {
  processPayment(amount);
}
```

Add tests for boundary conditions:
```typescript
it('should reject zero amount', () => {
  expect(() => service.processPayment(0)).toThrow();
});

it('should reject amount exceeding maximum', () => {
  expect(() => service.processPayment(MAX_AMOUNT + 1)).toThrow();
});

it('should process valid amount', () => {
  expect(service.processPayment(50)).toBeDefined();
});
```

## Performance

- Mutation testing is slower than unit tests (typically 5-10x)
- 310 files typically generate 5,000-8,000 mutations
- Full test run usually takes 10-30 minutes depending on test suite size
- Run on specific modules for faster feedback during development

## Troubleshooting

### Tests fail during mutation run

- Check backend unit tests pass first: `npm run test --workspace=apps/backend`
- Verify test configuration is correct in `apps/backend/jest.config.js`
- Use debug mode: `npx stryker run --fileLogLevel trace`

### High memory usage

- Reduce `concurrency` in `stryker.conf.js`
- Run on a subset of files: `stryker run --mutate "apps/backend/src/auth/**/*.ts"`

### Timeout errors

- Increase `timeoutMS` in configuration
- Check for infinite loops in tests
- Run tests with increased timeout: `npm test -- --testTimeout=10000`

## Mutation Testing in CI/CD

Consider running mutation tests for:
- Critical authentication modules
- Payment processing logic
- Stellar contract interactions
- Data validation services

Example GitHub Actions step:
```yaml
- name: Run mutation tests
  run: npm run test:mutation
  
- name: Upload mutation report
  uses: actions/upload-artifact@v3
  with:
    name: mutation-report
    path: coverage/mutation/
```

## Resources

- [Stryker Documentation](https://stryker-mutator.io/)
- [Mutation Testing Concepts](https://stryker-mutator.io/docs/stryker-js/introduction/)
- [Jest Configuration](https://jestjs.io/docs/configuration)

## Related Documentation

- [Testing Strategy](./testing-strategy.md)
- [Backend Testing](../apps/backend/README.md)
- [CI/CD Pipeline](./deployment-runbook.md)
