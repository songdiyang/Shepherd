# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within SAF, please send an email to security@shepherd.local. All security vulnerabilities will be promptly addressed.

## Security Measures

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- API key validation
- Session management

### 2. Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### 3. Communication Security
- TLS/SSL encryption
- Secure WebSocket connections
- Rate limiting
- Request timeout handling

### 4. Audit & Compliance
- Tamper-proof audit logs (hash chain)
- Action attribution
- Compliance rule enforcement
- GDPR/SOX/HIPAA support

## Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for sensitive configuration
3. **Enable 2FA** for all accounts
4. **Regular security audits** of dependencies
5. **Keep dependencies updated**

## Responsible Disclosure

We follow responsible disclosure practices:
1. Report privately
2. Allow 90 days for fix
3. Coordinate public disclosure
4. Credit the reporter

---

**Last updated:** 2026-06-09
