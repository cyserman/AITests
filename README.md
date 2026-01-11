# CaseCraft Pro Unified

**TruthTrack™ Technology for Pro Se Litigation**

A forensic-grade legal case management system designed for self-represented litigants. Built with AI-powered pattern detection, immutable evidence tracking, and court-ready motion generation.

---

## 🎯 Overview

CaseCraft Pro Unified helps you:
- **Organize evidence** with cryptographic hashing and timestamps
- **Build timelines** that tell your story chronologically
- **Generate motions** with proper legal formatting
- **Detect patterns** using AI to identify strategic advantages
- **Monitor proceedings** with real-time court advocate AI

**Current Case**: Firey v. Firey (Montgomery County, PA)  
**Faith Score**: 90%+ (Production Ready)  
**Version**: 2.0.0

---

## ✨ Features

### 🔒 **The Vault (Evidence Spine)**
- Immutable evidence storage with SHA-256 hashing
- 5 case events pre-loaded (PFA, Camper incident, July 4th, Counsel withdrawal, Christmas denial)
- CSV import for bulk evidence upload
- Verification status tracking (Verified, Pending, Disputed)

### 📚 **The Library (Timeline)**
- Chronological case narrative builder
- Multi-lane organization (Custody, Financial, Safety, Procedural)
- Exhibit code management
- Neutralization tools for "Say Less" strategy

### ⚖️ **Court Prep (Motion Builder)**
- Auto-generate court-ready motions
- Professional legal formatting
- Exhibit references with source citations
- Copy to clipboard or export as Markdown

### 🎙️ **Live Advocate**
- Real-time courtroom monitoring (experimental)
- Audio transcription with Gemini 2.5 Flash
- Contradiction detection against Truth Spine
- Strategic whisper suggestions

### 🤖 **Pattern Audit (AI Analysis)**
- AI-powered case analysis using Gemini 1.5 Pro
- Conflict detection and strategic recommendations
- "Say Less" strategy generation
- NotebookLM export (JSON schema format)

### 📝 **Sticky Notes**
- Private annotations on evidence
- Draggable, resizable notes
- Auto-save to localStorage

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### **Installation**

```bash
# Clone the repository
git clone https://github.com/cyserman/AITests.git
cd AITests

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Gemini API key to .env.local
echo "GEMINI_API_KEY=your_api_key_here" >> .env.local
```

### **Development**

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### **Production Build**

```bash
npm run build
npm run preview
```

---

## 📊 Your Case Data

The app comes pre-loaded with 5 real case events:

| ID | Date | Event | Exhibit | Lane |
|----|------|-------|---------|------|
| EVT-0001 | Nov 1, 2024 | PFA order filed | PKT-001 | Procedural |
| EVT-0002 | Nov 23, 2024 | Camper incident | EVT-0002 | Custody |
| EVT-0003 | Jul 4, 2024 | July 4th exchange | CL-003 | Custody |
| EVT-0004 | Dec 1, 2024 | Counsel withdrawal | EVT-0004 | Procedural |
| EVT-0005 | Dec 25, 2024 | Christmas denial | EVT-0005 | Custody |

**To add more evidence**: See [Adding Evidence](#-adding-evidence) below.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 1.5 Pro/Flash, 2.5 Flash (audio)
- **Storage**: localStorage (client-side)
- **Deployment**: Vercel-ready

---

## 📝 Adding Evidence

### **Option 1: CSV Import**
1. Go to **The Vault** tab
2. Click **"Import Evidence"** button
3. Upload CSV with these columns:
   ```
   event_id, date, event_type, short_title, description,
   source, exhibit_refs, reliability, notes
   ```

**Example CSV:**
```csv
event_id,date,event_type,short_title,description,source,exhibit_refs,reliability,notes
EVT-0006,2025-01-15,INCIDENT,New incident,Description here,Source name,EX-006,High,Additional notes
```

### **Option 2: Edit Code**
Add to `YOUR_CASE_DATA` array in `App.tsx`:

```typescript
{
  id: 'EVT-0006',
  type: EvidenceType.INCIDENT,
  sender: 'Event Title',
  content: 'Event description',
  timestamp: '2025-01-15T00:00:00.000Z',
  hash: 'unique_hash',
  verified: true,
  verificationStatus: VerificationStatus.VERIFIED,
  isInTimeline: true,
  exhibitCode: 'EX-006',
  lane: 'CUSTODY',
  tags: ['TAG'],
  reliability: 'High',
  source: 'Source name',
  notes: 'Additional context'
}
```

---

## 🌐 Deployment

### **Deploy to Vercel** (Recommended)

1. Push to GitHub (already done ✅)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import `cyserman/AITests` repository
4. Add environment variable:
   - **Key**: `API_KEY`
   - **Value**: Your Gemini API key
5. Click **Deploy**

**Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🔐 Security & Privacy

- ✅ **Client-side only** - No server-side data storage
- ✅ **localStorage** - All data stays in your browser
- ✅ **API key** - Stored as environment variable (never in code)
- ✅ **HTTPS** - Encrypted traffic on production
- ✅ **No tracking** - No analytics or third-party scripts

---

## 🧪 Testing

The app has been audited and all critical issues resolved:

- ✅ **Null safety** - No runtime crashes from undefined values
- ✅ **API validation** - Gemini API key checked before use
- ✅ **Stable models** - Using production Gemini 1.5/2.5 (not preview)
- ✅ **Error handling** - Graceful fallbacks for all async operations

**Faith Score**: 90%+ (Production Ready)

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Full deployment guide
- **[App.tsx](./App.tsx)** - Main application logic
- **[types.ts](./types.ts)** - TypeScript interfaces

---

## 🤝 Contributing

This is a personal legal case management tool. If you'd like to adapt it for your own use:

1. Fork the repository
2. Update `YOUR_CASE_DATA` in `App.tsx` with your evidence
3. Modify case details in `services/gemini.ts` (line 15-17)
4. Deploy to your own Vercel account

---

## 📞 Support

**Repository**: [github.com/cyserman/AITests](https://github.com/cyserman/AITests)  
**Issues**: Create an issue on GitHub  
**License**: MIT

---

## 🎉 Acknowledgments

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini](https://ai.google.dev/)

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

**CaseCraft Pro Unified** - Empowering Pro Se Litigants with AI  
*Version 2.0.0 | January 2026*
