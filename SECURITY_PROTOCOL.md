# Security Protocol
**CaseCraft Pro Unified - Security Architecture and Best Practices**

Version: 2.0.0  
Last Updated: January 9, 2026  
Status: Production Ready

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Data Privacy Architecture](#data-privacy-architecture)
3. [Cryptographic Standards](#cryptographic-standards)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Key Management](#api-key-management)
6. [Secure Communication](#secure-communication)
7. [Data Storage Security](#data-storage-security)
8. [Export Security](#export-security)
9. [Deployment Security](#deployment-security)
10. [Incident Response](#incident-response)
11. [Compliance](#compliance)

---

## Security Overview

CaseCraft Pro Unified is designed with a **privacy-first, local-first** architecture that prioritizes data security and user control. The system assumes that all evidence is sensitive and potentially subject to attorney-client privilege, implementing multiple layers of protection.

### Security Principles

1. **Local-First Storage**: All data stored in browser by default
2. **Minimal External Communication**: Only user-initiated AI features connect to external APIs
3. **Cryptographic Integrity**: SHA-256 hashing on all evidence
4. **Zero-Trust Architecture**: No automatic data transmission
5. **Transparent Operations**: All external API calls visible to user

---

## Data Privacy Architecture

### Storage Layers

#### Primary Storage: Browser LocalStorage
- **Location**: User's local browser storage
- **Encryption**: At-rest encryption provided by browser
- **Access Control**: Same-origin policy (browser enforced)
- **Persistence**: Survives browser restarts
- **Capacity**: ~10MB typical limit
- **Backup**: User responsibility (export functionality provided)

#### Temporary Storage: Browser Memory
- **Location**: JavaScript runtime
- **Duration**: Session lifetime
- **Use Cases**: Active evidence editing, UI state
- **Cleared**: On page refresh or browser close

#### No Server-Side Storage
- **Critical**: CaseCraft Pro Unified does NOT store user data on servers
- **Exception**: Vercel hosting serves static files only (no user data)
- **AI Processing**: Gemini API processes requests but does not store case data

### Data Flow Diagram

```
User Evidence
     ↓
  Browser
     ↓
LocalStorage (primary)
     ↓
Export Functions (user-initiated)
     ↓
- NotebookLM Export (local file)
- Motion Builder (clipboard)
- CSV Export (local file)
     ↓
Optional: Gemini API (text only, no storage)
```

---

## Cryptographic Standards

### SHA-256 Hashing

**Implementation**: Web Crypto API (native browser)

```typescript
// Standard implementation used throughout codebase
async function calculateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
```

**Security Properties**:
- **Collision Resistance**: Computationally infeasible to find two inputs with same hash
- **Pre-image Resistance**: Cannot derive input from hash
- **Deterministic**: Same input always produces same hash
- **Avalanche Effect**: Small input change produces drastically different hash

**Use Cases**:
1. Evidence fingerprinting (all Truth Spine items)
2. Duplicate detection (import deduplication)
3. Integrity verification (export validation)
4. Court admissibility (independent verification)

### HTTPS Requirement

**Critical**: CaseCraft MUST be deployed over HTTPS

**Reasons**:
1. Web Crypto API requires secure context
2. SHA-256 operations fail on HTTP
3. Prevents man-in-the-middle attacks
4. Protects Gemini API key in transit

**Enforcement**:
- Vercel provides automatic HTTPS
- Development: use `localhost` (secure context exception)
- Production: SSL/TLS certificate required

---

## Authentication & Authorization

### Current Architecture: Single-User Browser-Based

CaseCraft Pro Unified v2.0 is designed for single-user operation:
- No login system required
- No user accounts
- No central authentication server
- Access control via browser (device access)

### Multi-User Deployment (Future)

For organizations requiring multi-user access:

**Authentication Requirements**:
- OAuth 2.0 / OIDC integration
- Role-based access control (RBAC)
- Audit logging of all evidence access
- Session management with timeout

**Authorization Levels** (proposed):
1. **Attorney**: Full access to all evidence
2. **Paralegal**: Read/write evidence, no deletion
3. **Client**: Read-only access to designated evidence
4. **External Reviewer**: Time-limited read access

---

## API Key Management

### Gemini API Key

**Storage**:
- Environment variable: `VITE_GEMINI_API_KEY`
- NOT stored in code
- NOT committed to Git (.gitignore enforced)
- Injected at build time (Vercel environment variables)

**Production Best Practices**:

1. **Rotation Policy**:
   - Rotate API keys every 90 days
   - Generate new key in Google AI Studio
   - Update Vercel environment variable
   - Redeploy application

2. **Access Restriction**:
   - Use API key restrictions (HTTP referrer)
   - Limit to specific domains (e.g., `casecraft.example.com`)
   - Set usage quotas to prevent abuse
   - Monitor API usage in Google Cloud Console

3. ** Never Log API Keys**:
   ```typescript
   // WRONG
   console.log('API Key:', process.env.VITE_GEMINI_API_KEY);
   
   // CORRECT
   console.log('API Key configured:', !!process.env.VITE_GEMINI_API_KEY);
   ```

4. **Emergency Response**:
   - If key compromised: immediately revoke in Google AI Studio
   - Generate replacement key
   - Update Vercel environment
   - Redeploy within 5 minutes
   - Review API usage logs for unauthorized access

### Local Development

**`.env.local` file** (NEVER commit):
```bash
VITE_GEMINI_API_KEY=your_actual_key_here
```

**`.gitignore`** must include:
```
.env.local
.env*.local
*.key
secrets/
```

---

## Secure Communication

### External API Calls

CaseCraft makes external calls ONLY for AI features:

#### 1. Live Advocate Monitor
**Endpoint**: Google Gemini API (Multimodal Live)  
**Data Sent**: Audio transcription text (NOT audio file)  
**Purpose**: Real-time courtroom monitoring  
**Frequency**: During active monitoring session  
**User Control**: Explicit "Start Monitoring" button required

**Security Measures**:
- TLS 1.3 encryption
- API key authentication
- No audio file transmission
- Transcriptions not stored by Google (per Gemini API terms)

#### 2. Smart Import (PDF Decomposition)
**Endpoint**: Google Gemini API (Text generation)  
**Data Sent**: Extracted PDF text (NOT PDF file)  
**Purpose**: Document boundary detection  
**Frequency**: Per Smart Import operation  
**User Control**: Explicit "Upload" button required

**Security Measures**:
- TLS 1.3 encryption
- Text-only transmission (no binary files)
- Optional feature (can run without AI)
- User sees preview before import

#### 3. AI Analysis
**Endpoint**: Google Gemini API (Text generation)  
**Data Sent**: Evidence text + case metadata  
**Purpose**: Contradiction detection, readiness assessment  
**Frequency**: Per "Analyze Case" button click  
**User Control**: Explicit user action required

**Security Measures**:
- TLS 1.3 encryption
- Text-only transmission
- User reviews results before export
- No automatic analysis

### Network Security

**HTTP Headers** (configured in `vercel.json`):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; connect-src 'self' https://generativelanguage.googleapis.com;"
        }
      ]
    }
  ]
}
```

---

## Data Storage Security

### LocalStorage Protection

**Browser Security Features**:
- Same-origin policy: Only CaseCraft domain can access its data
- Isolated from other websites
- Cleared when browser data cleared (user action)

**Limitations**:
- NOT encrypted by default
- Accessible via browser DevTools (if device compromised)
- No protection if device stolen while logged in

**Mitigation**:
1. **Device Security**: Encourage users to:
   - Use full-disk encryption (BitLocker, FileVault)
   - Lock devices when unattended
   - Use strong device passwords
2. **Sensitive Cases**: For highly sensitive cases, recommend:
   - Dedicated device for CaseCraft only
   - No sharing of device
   - Regular data exports with offline storage

### Data Sanitization

**Input Validation**:
```typescript
// All user input sanitized before storage
function sanitizeInput(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .trim();
}
```

**Output Encoding**:
- React automatically escapes JSX content
- No `dangerouslySetInnerHTML` used without sanitization
- CSV exports properly escape special characters

---

## Export Security

### NotebookLM Export

**Format**: Plain text Markdown  
**Security Concerns**:
- Contains full case evidence
- Includes SHA-256 hashes
- May have private sticky notes

**User Controls**:
1. **Private Notes Toggle**: Option to exclude private annotations
2. **Download Location**: User chooses where file saved
3. **File Naming**: Timestamp included (e.g., `casecraft-export-2026-01-09.md`)

**Best Practices**:
- Store exports in encrypted folder
- Use secure cloud storage (e.g., Google Drive with 2FA)
- Delete old exports after uploading to NotebookLM

### Motion Builder Export

**Format**: Markdown copied to clipboard  
**Security Concerns**:
- Clipboard accessible to other apps
- May persist in clipboard history

**Mitigation**:
- Clear clipboard after pasting
- Use clipboard managers that encrypt history
- Consider manual file save option (future enhancement)

### CSV Export

**Format**: CSV file (for re-import or backup)  
**Security Concerns**:
- Contains raw evidence data
- No encryption applied

**Best Practices**:
- Encrypt CSV files before cloud storage
- Use password-protected ZIP archives
- Maintain offline backups on encrypted drives

---

## Deployment Security

### Vercel Platform Security

**Infrastructure Security**:
- DDoS protection (Vercel Edge Network)
- Automatic SSL/TLS certificates
- CDN caching (static assets only)
- Serverless architecture (no persistent server)

**Build Security**:
1. **Dependency Scanning**: Run `npm audit` before deployment
2. **Environment Variables**: Never expose in client bundle
3. **Source Maps**: Disable in production (`vite.config.ts`):
   ```typescript
   build: {
     sourcemap: false
   }
   ```

### Continuous Security

**Pre-Deployment Checklist**:
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] `.env.local` not committed to Git
- [ ] API keys configured in Vercel environment
- [ ] HTTPS enabled and valid certificate
- [ ] CSP headers configured
- [ ] Source maps disabled
- [ ] Bundle size optimized
- [ ] No console.log with sensitive data

**Post-Deployment Verification**:
- [ ] HTTPS certificate valid (check browser lock icon)
- [ ] API calls succeed (test AI features)
- [ ] No mixed content warnings
- [ ] All static assets load correctly
- [ ] LocalStorage persists across sessions

---

## Incident Response

### Security Incident Classification

**Level 1 - Critical**:
- API key compromised and publicly exposed
- Evidence data leaked externally
- Unauthorized access to user evidence

**Response Time**: Immediate (< 5 minutes)

**Actions**:
1. Revoke compromised API key
2. Deploy new key
3. Notify affected users
4. Review access logs
5. Implement additional restrictions

**Level 2 - High**:
- Vulnerability discovered in code
- Dependency CVE  (CVSS > 7.0)
- Attempted unauthorized access

**Response Time**: < 24 hours

**Actions**:
1. Assess impact
2. Deploy patch or workaround
3. Update dependencies
4. Test thoroughly
5. Deploy to production

**Level 3 - Medium**:
- Non-critical dependency vulnerability
- Performance degradation
- Minor UI security issue

**Response Time**: < 1 week

**Actions**:
1. Create GitHub issue
2. Plan fix in next release
3. Deploy with next batch of updates

### Contact Protocol

**Security Issues**: Report privately via email (not public GitHub issues)  
**Responsible Disclosure**: 90-day disclosure window for external researchers  
**Bug Bounty**: (Future) Reward responsible vulnerability disclosure

---

## Compliance

### Attorney-Client Privilege

**Considerations**:
- All evidence presumed privileged
- No third-party access without client consent
- Cloud storage must be encrypted
- Subpoena resistance (local-first helps)

**Recommendations**:
- Document use of AI features in engagement letter
- Obtain client consent for Gemini API usage
- Maintain audit trail of all evidence access
- Enable two-factor authentication on cloud backups

### Data Retention

**Default Policy**: Indefinite (user-controlled)

**User Responsibilities**:
- Manually clear LocalStorage when case concludes
- Archive exports to long-term storage
- Follow firm/jurisdiction retention policies

**Automated Cleanup** (Future):
- Scheduled export reminders
- Automatic stale data warnings
- Archive-to-cloud functionality

### GDPR / Privacy Regulations

**Current Status**: Not GDPR-compliant (no EU deployment planned)

**If EU Deployment Required**:
- [ ] Data Processing Agreement with Gemini API
- [ ] Right to erasure (LocalStorage.clear())
- [ ] Right to data portability (export functions)
- [ ] Privacy policy documenting AI usage
- [ ] Cookie consent banner (if analytics added)

---

## Security Roadmap

### Short-Term (v2.1)
- [ ] Implement Content Security Policy v2
- [ ] Add export encryption option
- [ ] Automated dependency vulnerability scanning
- [ ] Security headers audit

### Medium-Term (v2.5)
- [ ] End-to-end encrypted cloud sync
- [ ] Multi-user RBAC system
- [ ] Audit logging export
- [ ] Two-factor authentication option

### Long-Term (v3.0)
- [ ] Zero-knowledge architecture
- [ ] Client-side encryption before cloud
- [ ] Blockchain evidence timestamping
- [ ] Formal security audit

---

## Appendix: Security Checklist

### For Developers

- [ ] Never commit `.env.local` files
- [ ] Use environment variables for secrets
- [ ] Sanitize all user input
- [ ] Escape all output
- [ ] Run `npm audit` before each release
- [ ] Review dependency licenses
- [ ] Test HTTPS locally before deployment
- [ ] Disable debugging logs in production

### For Deployers

- [ ] Configure Vercel environment variables
- [ ] Enable automatic HTTPS
- [ ] Set up custom domain with valid SSL
- [ ] Configure security headers
- [ ] Test API key restrictions
- [ ] Monitor API usage quotas
- [ ] Set up error alerts

### For Users

- [ ] Use full-disk encryption on device
- [ ] Lock device when away
- [ ] Export backups to encrypted storage
- [ ] Clear clipboard after Motion Builder
- [ ] Review evidence before AI analysis
- [ ] Use strong passwords for cloud storage
- [ ] Enable 2FA on Google/cloud accounts

---

**Document Version**: 2.0.0  
**Last Review**: January 9, 2026  
**Next Review**: April 9, 2026  
**Maintained By**: CaseCraft Security Team

---

*This security protocol is a living document. Report security concerns immediately and update this document after any security incident or major architectural change.*
