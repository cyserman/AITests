
# TruthDock™ Tactical

A high-performance floating panel interface designed for legal professionals and individuals managing complex case data. TruthDock™ acts as a specialized "Spine Intelligence" layer, helping you organize disparate fragments into a cohesive legal narrative while synchronizing directly with research tools like **NotebookLM**.

## Key Features

- **Intelligent Ingest**: Robust file intake supporting `.pdf`, `.txt`, `.docx`, `.csv`, `.json`, and `.msg`.
- **Integrity Audit**: Real-time verification of artifact hashes to prevent duplicates or stale evidence from entering the case spine.
- **NotebookLM Master Sync**: Generate a "Master Source" file formatted specifically to ground NotebookLM models in your case narrative.
- **Conflict Analysis**: Advanced AI detection of factual contradictions across your history of statements.
- **Native Briefing Node**: Real-time audio interaction for "hands-free" interrogation of your case database.

---

## Hooking Up to NotebookLM (NBLM)

TruthDock™ is specifically tuned to improve NotebookLM's accuracy and grounding. Follow these "tricks" to optimize your workflow:

### 1. The "Master Source" Trick
Instead of uploading 50 small text files to NotebookLM, use the **Sync Master Source** button. TruthDock™ compiles all fragments into a single, structured `.txt` document with:
- Temporal metadata
- Source headers for each fragment
- Content hashes for forensic verification

**Why?** NotebookLM builds a more accurate knowledge graph when it sees your data as a cohesive, structured "Case Spine" rather than scattered pieces.

### 2. The Grounding Directives
When chatting with NotebookLM, you can use TruthDock's metadata:
- *"According to the Master Source, which document has ID 'a7b2c'?"*
- *"Identify the contradiction between Source Fragment #4 and Fragment #12."*

### 3. Quick-Paste Chat
Use the **Quick Copy** button to instantly grab a Markdown-formatted summary of your current spine. This is perfect for pasting into a new NotebookLM chat session to "warm up" the model's context before deep diving into specific sources.

---

## Intake Troubleshooting

- **Invalid File Type**: TruthDock™ currently accepts text-based and common document formats. If you have an image-based PDF, run it through OCR before intake.
- **Stale Version**: The system detected a newer version of this content already exists in the spine. Check the Integrity Audit log for details.
- **Empty Artifact**: The file contains no usable data stream.

---
*Developed for CaseCraft Foundation // ProSePower Engine v3.1.5*
