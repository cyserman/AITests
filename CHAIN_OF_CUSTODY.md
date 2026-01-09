# Chain of Custody Protocol
**CaseCraft Pro Unified - Forensic Evidence Management**

Version: 2.0.0  
Last Updated: January 9, 2026  
Status: Production Ready

---

## Executive Summary

CaseCraft Pro Unified implements a rigorous chain of custody protocol designed to ensure that all evidence is forensically sound, independently verifiable, and admissible in court proceedings. This document outlines the technical and procedural safeguards that maintain evidence integrity from intake through final presentation.

---

## Core Principles

### 1. Immutability
Once evidence enters the Truth Spine, its content cannot be altered. The system enforces this through:
- **SHA-256 cryptographic hashing** on all evidence items
- **Immutable storage architecture** where `contentOriginal` field is never edited
- **Separation of layers** between raw evidence (Truth Spine) and strategic narrative (Forensic Swimlanes)

### 2. Traceability
Every piece of evidence maintains a complete audit trail:
- **Import timestamp** (`importedAt` field)
- **Source attribution** (file name, page number, import method)
- **Verification status** (Verified, Pending Review, Disputed)
- **Tag history** showing categorization and lane assignment
- **Exhibit codes** (format: SI-XXX for Smart Import, custom for manual entry)

### 3. Independent Verification
All evidence hashes can be independently verified:
- SHA-256 hashes are calculated using Web Crypto API (browser-native)
- Export formats include hash values for external verification
- Each export includes the original source metadata for reconstruction

---

## Evidence Intake Protocol

### Layer 1: Import and Hashing

All evidence enters through one of three intake methods:

#### A. Smart Import (PDF Decomposition)
1. User uploads multi-document PDF bundle
2. System extracts text using pdf.js
3. AI-powered boundary detection identifies individual documents
4. Each document receives:
   - Unique ID (timestamp + index)
   - SHA-256 hash calculated from metadata
   - Document type classification
   - Lane assignment
   - Exhibit code (SI-XXX format)
5. User reviews detected documents before import
6. Upon confirmation, documents are committed to Truth Spine

**Chain of Custody Markers:**
- Original PDF filename
- Page range within source PDF
- Extraction timestamp
- SHA-256 hash of document content
- Boundary detection confidence score

#### B. CSV Import (Structured Data)
1. User uploads CSV file (e.g., text message exports)
2. Parser validates format and extracts fields
3. Each row becomes a SpineItem with:
   - Timestamp from data
   - Sender/recipient information
   - Message content
   - Platform indicator (SMS, AppClose, etc.)
   - Category classification
4. SHA-256 hash calculated for each message
5. Duplicate detection via hash comparison
6. Import batch committed to Truth Spine

**Chain of Custody Markers:**
- Source CSV filename
- Row number in original file
- Import timestamp
- SHA-256 hash of message content + metadata
- Duplicate detection result

#### C. Manual Entry
1. User creates evidence item via UI
2. System captures:
   - Entry timestamp
   - Content
   - User-assigned tags
   - Verification status
3. SHA-256 hash calculated immediately
4. Item committed to Truth Spine

**Chain of Custody Markers:**
- Manual entry timestamp
- User identifier (if multi-user)
- SHA-256 hash
- Initial verification status

### Layer 2: Verification and Promotion

After import, evidence undergoes verification:

1. **Initial Status**: All evidence starts as "Pending Review"
2. **Verification Process**:
   - User reviews content for accuracy
   - Compares against source material
   - Validates metadata (dates, parties, etc.)
   - Sets verification status: Verified / Disputed / Needs Clarification
3. **Promotion to Timeline**:
   - Only verified evidence can be promoted to Forensic Swimlanes
   - Promotion creates reference link (not duplicate)
   - Original evidence remains in Truth Spine
   - Timeline event references spine item via `spine_refs` array

**Chain of Custody Markers:**
- Verification timestamp
- Verification status
- Promotion timestamp (if applicable)
- Lane assignment
- Narrative beat title (if strategic promotion)

### Layer 3: Neutralization and Export

For court document generation:

1. **Neutralization**:
   - User creates `contentNeutral` summary (human-written only)
   - Original content remains untouched
   - Neutralization timestamp recorded
2. **Selection for Motion Builder**:
   - Only neutralized, verified evidence available
   - System displays both original and neutral versions
   - User selects items for inclusion
3. **Document Generation**:
   - Motion includes exhibit codes and SHA-256 hashes
   - References to spine items preserved
   - Export includes full chain of custody metadata

**Chain of Custody Markers:**
- Neutralization timestamp
- Both contentOriginal and contentNeutral preserved
- Export timestamp
- Document type (Motion, Response, etc.)
- Complete hash chain in footer

---

## Hash Calculation Standard

### Implementation
```typescript
async function calculateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
```

### Hash Components
For each evidence type, the hash is calculated from:

**SpineItem (Text Message):**
- Timestamp
- Sender
- Recipient
- Message content
- Platform

**Document (PDF Import):**
- Document metadata (title, date, type)
- Extracted text content
- Page range
- Source filename

**Manual Evidence:**
- Content
- Entry timestamp
- Tags
- Initial verification status

### Hash Verification
Any third party can verify hashes by:
1. Exporting evidence to NotebookLM format
2. Extracting the content and metadata
3. Running the same hash function
4. Comparing output to stored hash

---

## Export Formats and Chain Preservation

### NotebookLM Export
The "Feed NotebookLM" export creates a complete evidence bundle:

```markdown
# CaseCraft: Forensic Strategic Context

## Case Metadata
- Case Name: [Case Title]
- Export Date: [ISO Timestamp]
- Total Evidence Items: [Count]

## Truth Spine (Immutable Evidence)

### Evidence Item 1
**ID**: SI-001
**Type**: Court Order
**Date**: 2024-11-05
**Lane**: Custody
**Verification**: Verified
**SHA-256**: a7b2c3d4e5f6...
**Source**: Motion Bundle.pdf (Pages 12-15)

**Content**:
[Full original content]

---

[Continues for all evidence items]

## Forensic Swimlanes
[Organized by lane showing promoted evidence]

## Digital Signature
TruthTrack™ Verified | SHA-256 Authenticated Repository
Export Timestamp: [ISO Timestamp]
```

### Motion Builder Export
Court documents include:

1. **Evidence Section**:
   - Exhibit codes
   - SHA-256 hashes
   - Source citations
   - Verification status

2. **Footer**:
   ```
   This motion references evidence items from the CaseCraft Truth Spine.
   All evidence items are SHA-256 hashed and independently verifiable.
   Complete chain of custody available upon request.
   ```

---

## Audit Trail Components

Every evidence item maintains:

| Field | Purpose | Immutable? |
|-------|---------|------------|
| `id` | Unique identifier | Yes |
| `content` | Original evidence text | Yes |
| `contentOriginal` | Immutable copy (SpineItem) | Yes |
| `contentNeutral` | Human-written summary | No (can be refined) |
| `hash` | SHA-256 digest | Yes |
| `importedAt` | Import timestamp | Yes |
| `source` | Origin file/system | Yes |
| `verificationStatus` | Current status | No (updated during review) |
| `tags` | Categorization | No (can be refined) |
| `lane` | Strategic track | No (can be reassigned) |
| `isInTimeline` | Promotion status | No (changes on promotion) |

---

## Critical Invariants

The following rules MUST NEVER be violated:

1. **NEVER edit `contentOriginal`** - It represents immutable truth
2. **NEVER auto-populate `contentNeutral`** - Only human summaries allowed
3. **ALWAYS hash before storage** - No evidence without hash
4. **NEVER duplicate evidence** - Use references (spine_refs)
5. **ALWAYS preserve source metadata** - File name, page range, timestamp
6. **NEVER delete from Truth Spine** - Deprecate or mark disputed instead

---

## Dry-Run Validation

To verify chain of custody integrity:

1. **Export** current Truth Spine to NotebookLM format
2. **Record** all SHA-256 hashes
3. **Clear** local storage (test environment only!)
4. **Re-import** from original source files
5. **Re-export** Truth Spine
6. **Compare** hashes - should match exactly

This validation proves that the system can reconstruct the exact same evidence state from source files, confirming that the chain of custody is sound.

---

## Data Handling Privacy

### Local-First Architecture
- All evidence stored in browser LocalStorage by default
- No automatic cloud transmission
- AI features (Gemini) only send text content, never files
- User controls all exports

### API Interactions
When using AI features:
- **Live Advocate**: Audio transcribed via Gemini API (text only, not audio file)
- **Smart Import**: Document boundaries detected via Gemini API (text only)
- **AI Analysis**: Text content sent for contradiction detection

No evidence files leave the browser except through explicit user export actions.

### HTTPS Requirement
- Web Crypto API requires HTTPS
- SHA-256 hashing fails on HTTP
- All production deployments MUST use HTTPS

---

## Court Admissibility

This protocol satisfies legal standards for evidence admissibility:

### Authentication (FRE 901)
- SHA-256 hashes provide digital fingerprints
- Audit trail shows clear chain of custody
- Independent verification possible via hash recalculation

### Best Evidence Rule (FRE 1002)
- Original content preserved in `contentOriginal`
- Neutralized versions clearly marked
- Both versions available for court review

### Hearsay Exception (FRE 803(6))
- Business records exception applicable
- Regular practice to maintain evidence
- Trustworthy computerized systems

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-01 | Initial protocol for CaseCraft Pro |
| 2.0.0 | 2026-01-09 | Unified protocol including Smart Import, TruthDock integration |

---

**Maintained by**: CaseCraft Development Team  
**Contact**: See repository for support channels  
**License**: See LICENSE file

---

*This chain of custody protocol ensures that CaseCraft Pro Unified maintains forensic integrity suitable for court proceedings while providing the flexibility needed for strategic case development.*
