# Security Guidelines

## OWASP ZAP Security Scanning

This project uses OWASP ZAP (Zed Attack Proxy) for automated security scanning in the CI/CD pipeline.

### Understanding ZAP Findings

ZAP performs baseline security scans on the running application to identify common vulnerabilities. Findings are categorized by severity:

- **CRITICAL**: Immediate action required. Blocks deployment.
- **HIGH**: Significant security risk. Should be addressed before release.
- **MEDIUM**: Moderate risk. Plan remediation.
- **LOW**: Minor issues. Consider for future improvements.
- **INFO**: Informational findings. No action required.

### Triaging ZAP Findings

1. **Review the Report**: Check the `zap-report.html` artifact in GitHub Actions
2. **Understand the Issue**: Each finding includes:
   - Description of the vulnerability
   - Affected URL/parameter
   - Risk level and confidence
   - Recommended remediation

3. **Remediation Steps**:
   - For false positives: Document and add to ZAP rules exclusion
   - For real issues: Fix the vulnerability in code
   - For accepted risks: Document the decision and risk acceptance

4. **Validation**: Re-run the scan after fixes to confirm resolution

### Common ZAP Findings and Fixes

#### Missing Security Headers
- **Issue**: Application missing security headers (CSP, X-Frame-Options, etc.)
- **Fix**: Add security headers in backend middleware or frontend meta tags

#### SQL Injection
- **Issue**: Unsanitized user input in database queries
- **Fix**: Use parameterized queries and ORM features (TypeORM in this project)

#### Cross-Site Scripting (XSS)
- **Issue**: Unescaped user input in HTML output
- **Fix**: Use framework's built-in escaping (React/Next.js auto-escapes by default)

#### Insecure Direct Object References (IDOR)
- **Issue**: Direct access to resources without authorization checks
- **Fix**: Implement proper authorization guards (RolesGuard in NestJS)

### Running ZAP Locally

To test security locally before pushing:

```bash
# Install ZAP
docker pull owasp/zap2docker-stable

# Run baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000 -r report.html
```

### CI/CD Integration

ZAP runs automatically on:
- Pull requests to main branch
- Pushes to main branch

The scan will fail the CI if HIGH severity findings are detected. Review and fix before merging.

## Cargo Audit & Deny

Rust dependencies are scanned for known vulnerabilities using `cargo audit` and `cargo deny`.

### Cargo Audit

Checks for known security vulnerabilities in dependencies:

```bash
cargo audit --deny warnings
```

### Cargo Deny

Enforces licensing and dependency policies:

```bash
cargo deny check
```

Configuration is in `deny.toml` at the repository root.

### Handling Vulnerabilities

1. **Update Dependencies**: `cargo update` to get patched versions
2. **Review Advisories**: Check the advisory details
3. **Accept Risk**: If no patch available, document the decision
4. **Report Upstream**: Contact maintainers if critical

## Code Quality

See `sonar-project.properties` for SonarCloud configuration. Quality gates require:
- Code coverage ≥ 70%
- No new critical issues
- Maintainability rating A or B

## Linting & Formatting

All code must pass ESLint and Prettier checks:

```bash
# Frontend
npm run lint --workspace=apps/frontend
npm run format:check --workspace=apps/frontend

# Backend
npm run lint --workspace=apps/backend
npm run format:check --workspace=apps/backend
```

Auto-fix issues:

```bash
npm run lint:fix --workspace=apps/frontend
npm run format --workspace=apps/frontend
npm run lint:fix --workspace=apps/backend
npm run format --workspace=apps/backend
```
