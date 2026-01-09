# CaseCraft Pro Unified - Quick Start Guide

**Get up and running in 5 minutes**

---

## Installation

### Option 1: Use the Deployed Version
Visit the live deployment at your Vercel URL (provided after deployment).

### Option 2: Run Locally
```bash
cd casecraft-pro-unified
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## First Steps

### 1. Import Your Evidence

**Smart Import (Recommended for PDF bundles)**
1. Click **"Smart Import"** button in the Truth Spine
2. Upload your PDF file (e.g., 166-page case file)
3. Wait for AI analysis (shows progress)
4. Review detected documents
5. Click **"Import to Truth Spine"**

**CSV Import (For structured data)**
1. Click the import icon in the header
2. Select your CSV file
3. Map columns to evidence fields
4. Confirm import

**Manual Entry**
1. Navigate to Truth Spine
2. Click **"Add Evidence"**
3. Fill in the form
4. Save

---

### 2. Organize Your Evidence

**Tagging**
- Click any evidence item
- Type tags in the tag field
- Press Enter to add
- Tags flow into swimlanes automatically

**Verification**
- Click the status badge on evidence items
- Cycle through: Pending → Verified → Disputed
- Only verified evidence appears in exports

**Promote to Timeline**
- Click the timeline icon on evidence items
- Evidence appears in Forensic Swimlanes
- Organize by lane: Safety, Custody, Financial, Procedural

---

### 3. Build Your Timeline

**Navigate to Forensic Swimlanes**
1. Click **"Timeline"** in the sidebar
2. View evidence across four tracks
3. Drag items between lanes if needed
4. Add narrative beats for key events

**Create Narrative Beats**
1. Click **"Add Beat"** in timeline view
2. Title the event (e.g., "First PFA Filed")
3. Link relevant evidence items
4. Assign to appropriate lane

**Export to NotebookLM**
1. Click **"Feed NotebookLM"** button
2. Download the Markdown file
3. Upload to NotebookLM
4. Ask for pattern analysis

---

### 4. Generate Court Documents

**Motion Builder**
1. Navigate to **"Motions"** in sidebar
2. Select evidence items (checkboxes)
3. Choose document type
4. Review preview
5. Click **"Copy Markdown"**
6. Paste into your word processor

**Tips**
- Only neutralized evidence appears
- Exhibit codes are auto-generated
- SHA-256 hashes included for verification
- Follow "Say Less" approach

---

### 5. Courtroom Monitoring (Advanced)

**Live Advocate Monitor**
1. Navigate to **"Live"** in sidebar
2. Click **"Start Monitoring"**
3. Grant microphone permissions
4. System transcribes audio in real-time
5. AI queries Truth Spine for contradictions
6. Review insights panel for alerts

**Monitor Mode**
- High-contrast display for low-light courtrooms
- Discreet operation
- Instant evidence lookup
- Contradiction detection

---

## Key Features

### Truth Spine
- **Purpose**: Immutable evidence repository
- **Features**: Search, filter, tag, verify
- **Integrity**: SHA-256 hashing on all items
- **Smart Import**: AI-powered PDF decomposition

### Forensic Swimlanes
- **Purpose**: Strategic pattern visualization
- **Tracks**: Safety, Custody, Financial, Procedural
- **Theory**: Manufactured Imbalance detection
- **Export**: NotebookLM-ready format

### Motion Builder
- **Purpose**: Court-ready document generation
- **Approach**: "Say Less" neutralization
- **Format**: Markdown with exhibit references
- **Integrity**: SHA-256 hash verification

### Live Advocate Monitor
- **Purpose**: Real-time courtroom surveillance
- **Technology**: Gemini 2.5 Flash Native Audio
- **Features**: Transcription, contradiction detection
- **Interface**: High-contrast monitor mode

---

## Common Workflows

### Workflow 1: New Case Setup
1. Smart Import → Upload case file PDF
2. Review → Check detected documents
3. Import → Add to Truth Spine
4. Tag → Organize by category
5. Verify → Mark reliable evidence
6. Promote → Add key items to timeline

### Workflow 2: Motion Preparation
1. Timeline → Review evidence in swimlanes
2. Identify → Find pattern (e.g., custody gaps)
3. Select → Choose supporting evidence
4. Generate → Use Motion Builder
5. Export → Copy to word processor
6. File → Submit to court

### Workflow 3: Hearing Preparation
1. Review → Check timeline for contradictions
2. Export → Feed NotebookLM for AI analysis
3. Annotate → Add sticky notes with strategy
4. Practice → Use Live Advocate in test mode
5. Deploy → Bring to courtroom with monitor mode

---

## Tips & Best Practices

### Evidence Management
- **Tag everything immediately** - Tags drive organization
- **Verify as you go** - Don't wait until the end
- **Use exhibit codes** - Makes court references easier
- **Add source info** - Track where evidence came from

### Timeline Construction
- **Start with key events** - Build narrative beats first
- **Link evidence** - Connect items to beats
- **Check for gaps** - Look for missing time periods
- **Balance tracks** - Ensure all lanes have coverage

### Document Generation
- **Use neutralized evidence only** - Emotional language weakens motions
- **Include hashes** - Proves evidence integrity
- **Reference exhibits** - Makes cross-referencing easy
- **Keep it concise** - "Say Less" approach wins cases

### Courtroom Use
- **Test audio first** - Verify microphone works
- **Use monitor mode** - High contrast for courtrooms
- **Review transcripts** - Check for contradictions
- **Take notes** - Use sticky notes for follow-up

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo last change |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + F` | Focus search box |
| `Ctrl/Cmd + S` | Save current state |
| `Esc` | Close modal/dialog |

---

## Troubleshooting

### Smart Import Not Working
- Check that PDF has actual text (not just images)
- Verify pdf.js is loading (check browser console)
- Try a smaller file first
- Provide more specific context hint

### Evidence Not Appearing in Motion Builder
- Ensure evidence is promoted to timeline
- Check that evidence has `contentNeutral` field
- Verify status is not "Disputed"
- Refresh the page

### Live Advocate Won't Start
- Grant microphone permissions
- Check Gemini API key is configured
- Use Chrome or Edge browser
- Verify internet connection

### Build Errors
- Run `npm install` to reinstall dependencies
- Clear `node_modules` and reinstall
- Check Node.js version (need 20+)
- Review error messages in console

---

## Getting Help

### Documentation
- **DEPLOYMENT_GUIDE.md** - Complete technical documentation
- **WHITEPAPER.md** - Architecture and theory
- **README.md** - Project overview
- **Component docs** - JSDoc comments in code

### Support
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Community Q&A
- **Email** - For security concerns (see README)

---

## Next Steps

1. **Import your first case** - Use Smart Import with a PDF
2. **Build a timeline** - Organize evidence in swimlanes
3. **Generate a motion** - Test the Motion Builder
4. **Export to NotebookLM** - Get AI insights
5. **Practice courtroom mode** - Test Live Advocate

**You're ready to go!** 🚀

---

**Version**: 2.0.0  
**Last Updated**: January 8, 2026  
**Prepared by**: Manus AI
