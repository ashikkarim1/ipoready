# Security Headers Middleware Implementation

## Overview

This document describes the comprehensive security headers middleware configured in Next.js (`next.config.js`) to protect the IPOReady application against common web vulnerabilities.

## Implemented Security Headers

### 1. X-Content-Type-Options: nosniff
**Purpose**: Prevents MIME type sniffing attacks  
**Protection**: Stops browsers from interpreting files as different MIME types than declared  
**Value**: `nosniff`  
**Impact**: Forces the browser to respect the Content-Type header

```
X-Content-Type-Options: nosniff
```

### 2. X-Frame-Options: DENY
**Purpose**: Prevents clickjacking attacks  
**Protection**: Prohibits the page from being embedded in iframes  
**Value**: `DENY`  
**Alternatives**:
- `SAMEORIGIN` - Allow framing from same origin
- `ALLOW-FROM uri` - Allow from specific origin (deprecated in favor of CSP)

```
X-Frame-Options: DENY
```

### 3. X-XSS-Protection: 1; mode=block
**Purpose**: Legacy XSS protection (supplementary to CSP)  
**Protection**: Enables browser XSS filters and blocks page if XSS detected  
**Value**: `1; mode=block`  
**Note**: CSP is the modern approach; this is kept for legacy browser support

```
X-XSS-Protection: 1; mode=block
```

### 4. Strict-Transport-Security (HSTS)
**Purpose**: Forces HTTPS connections  
**Protection**: Prevents man-in-the-middle attacks and HTTP downgrade attacks  
**Value**: `max-age=31536000; includeSubDomains; preload`  
**Components**:
- `max-age=31536000` - 1 year in seconds (browser caches this directive)
- `includeSubDomains` - Apply HSTS to all subdomains
- `preload` - Include in HSTS preload list (optional, recommended)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Production Consideration**: Only set preload directive in production after testing.

### 5. Content-Security-Policy (CSP)
**Purpose**: Prevents XSS, injection, and other code execution attacks  
**Value**:
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
img-src 'self' data: https:; 
font-src 'self' https://fonts.gstatic.com; 
connect-src 'self' https://vitals.vercel-analytics.com; 
frame-ancestors 'none'; 
base-uri 'self'; 
form-action 'self'
```

**Directives**:
- `default-src 'self'` - All content from same origin by default
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` - Scripts from self, with inline scripts allowed (for Next.js)
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` - Styles from self and Google Fonts
- `img-src 'self' data: https:` - Images from self, data URIs, and HTTPS
- `font-src 'self' https://fonts.gstatic.com` - Fonts from self and Google Fonts
- `connect-src 'self' https://vitals.vercel-analytics.com` - CORS requests to self and analytics
- `frame-ancestors 'none'` - Prevents embedding in iframes (complements X-Frame-Options)
- `base-uri 'self'` - Restricts base URL modification
- `form-action 'self'` - Restricts form submissions to same origin

**Future Optimization**: Remove `'unsafe-inline'` and `'unsafe-eval'` once Tailwind and build system support nonces.

### 6. Referrer-Policy
**Purpose**: Controls what referrer information is shared  
**Protection**: Prevents leaking sensitive URLs to third parties  
**Value**: `strict-origin-when-cross-origin`  
**Behavior**:
- Full URL sent when same-origin request
- Only origin sent for cross-origin requests
- No referrer if downgrading HTTPS → HTTP

```
Referrer-Policy: strict-origin-when-cross-origin
```

### 7. Permissions-Policy (formerly Feature-Policy)
**Purpose**: Disables browser features not needed by the application  
**Protection**: Reduces attack surface, prevents unauthorized access to device features  
**Value**: `geolocation=(), microphone=(), camera=()`  
**Disabled Features**:
- `geolocation` - Prevents location tracking
- `microphone` - Prevents audio recording
- `camera` - Prevents video recording

```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Configuration in next.config.js

### Structure

The security headers are implemented as a reusable array in `next.config.js`:

```javascript
async headers() {
  const securityHeaders = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
    { key: 'Content-Security-Policy', value: '...' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
  ];
  
  return [
    // Static assets
    { source: '/_next/static/:path*', headers: [...securityHeaders] },
    // API routes
    { source: '/api/:path*', headers: [...securityHeaders] },
    // App pages
    { source: '/dashboard/:path*', headers: [...securityHeaders] },
    // Public pages
    { source: '/:path*', headers: securityHeaders },
  ];
}
```

## Route-Specific Header Configuration

### 1. Static Assets (/_next/static/:path*)
- **Cache-Control**: `public, max-age=31536000, immutable`
- **Security Headers**: All applied
- **Rationale**: These are content-hashed, safe to cache forever

### 2. API Routes (/api/:path*)
- **Cache-Control**: `private, no-cache, no-store, must-revalidate`
- **CORS Headers**: Dynamically set based on environment
- **Security Headers**: All applied
- **Rationale**: API responses must never be cached or shared

### 3. Authenticated Pages (/dashboard, /checklist, etc.)
- **Cache-Control**: `private, no-store`
- **Security Headers**: All applied
- **Rationale**: User-specific data must not be cached at CDN

### 4. Public Pages (/pricing, /resources, etc.)
- **Cache-Control**: `s-maxage=300, stale-while-revalidate=3600`
- **Security Headers**: All applied
- **Rationale**: Can cache at CDN for performance, but serve stale during revalidation

## CORS Configuration

The configuration also includes CORS headers for API routes:

```javascript
const corsHeaders = [
  { key: 'Access-Control-Allow-Origin', value: allowedOrigins[0] },
  { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With' },
  { key: 'Access-Control-Allow-Credentials', value: 'true' },
  { key: 'Access-Control-Max-Age', value: '86400' },
];
```

**Allowed Origins**:
- Production: `https://ipoready.ai`, `https://www.ipoready.ai`
- Development: `http://localhost:3000`, `http://localhost:3001`

## Testing Security Headers

### Using curl

Test a single endpoint:
```bash
curl -I http://localhost:3000/
```

Expected output includes:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Test API Routes

```bash
curl -I http://localhost:3000/api/company
```

Verify that:
- Security headers are present
- Cache-Control is set to `private, no-cache, no-store, must-revalidate`
- CORS headers are included (if applicable)

### Using the Test Script

Run the provided test script:
```bash
./test-security-headers.sh
```

This script:
- Verifies each security header is present
- Checks header values match expected values
- Tests multiple endpoints (public, API, authenticated)
- Generates a summary report

### Online Security Header Checkers

Test production URL with these tools:
- [securityheaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [Qualys SSL Labs](https://www.ssllabs.com/ssltest/)

## Known Issues & Trade-offs

### 1. Unsafe Inline Scripts
- **Issue**: CSP uses `'unsafe-inline'` and `'unsafe-eval'` for scripts
- **Reason**: Next.js and Tailwind require inline styles/scripts
- **Mitigation**: Plan to migrate to nonce-based CSP in future
- **Timeline**: Post-Phase 1

### 2. HSTS Preload
- **Current**: `preload` directive is included
- **Production**: Only enable after extensive testing
- **Warning**: Cannot be removed without browser cache expiration

### 3. Frame-Ancestors Policy
- **Directive**: `frame-ancestors 'none'` prevents all embedding
- **Impact**: Cannot be embedded in iframes on any domain
- **Reason**: Protects against clickjacking but prevents some integrations

## Browser Support

| Header | Chrome | Firefox | Safari | Edge | IE 11 |
|--------|--------|---------|--------|------|-------|
| X-Content-Type-Options | ✓ | ✓ | ✓ | ✓ | ✓ |
| X-Frame-Options | ✓ | ✓ | ✓ | ✓ | ✓ |
| X-XSS-Protection | ✓ | ✓ | ✓ | ✓ | ✓ |
| HSTS | ✓ | ✓ | ✓ | ✓ | ✗ |
| CSP | ✓ | ✓ | ✓ | ✓ | ✗ |
| Referrer-Policy | ✓ | ✓ | ✓ | ✓ | ✗ |
| Permissions-Policy | ✓ | ✓ | ~ | ✓ | ✗ |

## Compliance & Standards

### OWASP Top 10

These security headers address:
- **A01: Broken Access Control** - Frame and referrer policies
- **A03: Injection** - Content Security Policy
- **A04: Insecure Design** - Defense in depth approach
- **A05: Security Misconfiguration** - Secure defaults
- **A07: Identification and Authentication** - HSTS enforcement
- **A08: Software and Data Integrity** - CSP prevents tampering

### Security Standards

- **CWE-79**: Improper Neutralization of Input During Web Page Generation (XSS)
- **CWE-434**: Unrestricted Upload of File with Dangerous Type (MIME type sniffing)
- **CWE-693**: Protection Mechanism Failure (frame embedding)

## Deployment Checklist

- [ ] Test all security headers in development
- [ ] Verify API routes function with headers applied
- [ ] Check third-party integrations for CORS conflicts
- [ ] Review CSP policy for legitimate content sources
- [ ] Test across supported browsers
- [ ] Monitor for CSP violations in production
- [ ] Plan HSTS preload list submission (production only)
- [ ] Document any header overrides for specific routes
- [ ] Set up security header monitoring and alerts

## Monitoring & Maintenance

### Logs to Monitor

Look for CSP violations and CORS errors in application logs:
```
Content Security Policy violation: ...
CORS error: ...
```

### Regular Audits

- Monthly: Check for new vulnerabilities in OWASP Top 10
- Quarterly: Review header configuration against best practices
- Annually: Update HSTS max-age and reassess CSP policy

### Tools for Monitoring

- Use [Report-URI](https://report-uri.com) for CSP violation reporting
- Enable browser developer console logging for CSP warnings
- Monitor application error logs for CORS issues

## Future Improvements

1. **Nonce-based CSP**: Migrate from `'unsafe-inline'` to nonce-based script execution
2. **Report-URI Integration**: Set up CSP violation reporting
3. **Subresource Integrity (SRI)**: Add for external script/style dependencies
4. **Certificate Transparency**: Monitor HSTS preload list
5. **Automated Testing**: Integrate security header checks into CI/CD

## References

- [MDN: HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP: Secure Headers](https://owasp.org/www-project-secure-headers/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HSTS Spec](https://tools.ietf.org/html/rfc6797)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
