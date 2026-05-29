# Mutation Testing Guide

## Overview

Mutation testing verifies test quality by introducing small code changes (mutations) and checking if tests catch them. This ensures tests are effective at detecting bugs.

## Setup

Mutation testing is configured using Stryker with the following setup:

- **Test Runner**: Jest
- **Mutator**: TypeScript
- **Reporters**: HTML, JSON, Clear Text, Progress

## Running Mutation Tests

### Full mutation test suite
```bash
npm run test:mutation
```

### Generate HTML report
```bash
npm run test:mutation:report
```

The HTML report will be available at `coverage/mutation/index.html`

## Configuration

The Stryker configuration is in `stryker.conf.js` with:

- **Mutate**: All TypeScript files in `apps/backend/src` and `apps/frontend/src`
- **Exclude**: Test files, index files, and type definitions
- **Thresholds**:
  - High: 80% (excellent)
  - Medium: 60% (good)
  - Low: 40% (acceptable)

## Interpreting Results

- **Killed**: Mutation was caught by tests (good)
- **Survived**: Mutation was not caught (test gap)
- **Timeout**: Mutation caused infinite loop
- **Compile Error**: Mutation caused syntax error

## Best Practices

1. **Target Critical Modules**: Focus on business logic and security-sensitive code
2. **Improve Weak Tests**: High survival rates indicate insufficient test coverage
3. **Iterative Improvement**: Run mutation tests after adding new features
4. **CI Integration**: Consider adding mutation tests to CI pipeline for critical modules

## Example

If a mutation test shows a high survival rate in authentication logic, it means:
- Tests may not cover all edge cases
- Consider adding tests for boundary conditions
- Verify error handling is tested

## Performance

- Mutation testing is slower than unit tests (typically 5-10x)
- Run on critical modules first
- Use `maxConcurrentTestRunners` to control parallelization
