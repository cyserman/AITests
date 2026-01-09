# Cursor Composer Instructions: Spine Integration

## 🎯 Mission

Complete the integration of the **Text Spine System** into the CaseTimeline mobile app. This system provides immutable text log storage with manual promotion to timeline events and private sticky note annotations.

---

## 📋 What's Already Done

✅ **Spine Data Model** (`types/spine.ts`)
- SourceFile, SpineItem, TimelineEvent, StickyNote interfaces
- Event status lifecycle (asserted/denied/withdrawn/pending/resolved/fact)
- Message categories (Access_Denied, Financial_Strain, Hot_Read_Reactive, etc.)
- SHA-256 fingerprinting structure
- `created_at` timestamps on all entities
- Guardrail comments on `content_neutral` and `content_original`

✅ **CSV Parser** (`lib/csv-parser.ts`)
- Parses AppClose conversation exports
- Extracts timestamps, senders, messages, call logs
- Categorizes messages automatically
- **Tested with real data: 630 messages parsed successfully**

✅ **Real Data Available**
- `/home/ubuntu/upload/alltextsfvf-appclose%202025.csv` (1,829 lines, 630 messages)
- Covers full year of divorce case communications

---

## 🚀 Your Tasks (In Order)

### Phase 1: Storage Layer (Priority 1)

**Goal:** Replace AsyncStorage with proper database for spine data.

**Why:** AsyncStorage is too slow for 630+ messages. Need indexed queries.

**Tasks:**

1. **Install Dexie.js for React Native**
   ```bash
   cd /home/ubuntu/case-timeline-mobile
   pnpm add dexie dexie-react-hooks
   ```

2. **Create Database Schema** (`lib/spine-db.ts`)
   ```typescript
   import Dexie, { Table } from 'dexie';
   import { SourceFile, SpineItem, TimelineEvent, StickyNote } from '@/types/spine';

   export class SpineDatabase extends Dexie {
     sources!: Table<SourceFile, string>;
     spine!: Table<SpineItem, string>;
     timeline!: Table<TimelineEvent, string>;
     stickyNotes!: Table<StickyNote, string>;

     constructor() {
       super('CaseTimelineDB');
       this.version(1).stores({
         sources: 'id, file_hash, imported_at',
         spine: 'id, source_id, timestamp, counterpart, platform, category',
         timeline: 'id, date, lane, status, created_at',
         stickyNotes: 'id, target_type, target_id, created_at',
       });
     }
   }

   export const db = new SpineDatabase();
   ```

3. **Test Database**
   - Create a simple test to insert and query a SpineItem
   - Verify indexes work (query by timestamp, counterpart)

**Acceptance Criteria:**
- [ ] Dexie installed and configured
- [ ] Database schema created with proper indexes
- [ ] Can insert and query spine items
- [ ] No errors in console

---

### Phase 2: CSV Import UI (Priority 2)

**Goal:** Build UI to import the CSV file into the spine.

**Tasks:**

1. **Create Import Screen** (`app/(tabs)/import.tsx`)
   - Add new tab to tab bar (icon: `tray.and.arrow.down.fill`)
   - File picker button
   - Import progress indicator
   - Success/error messages
   - Show: messages imported, duplicates skipped, errors

2. **Wire Up CSV Parser**
   ```typescript
   import { importAppCloseCSV } from '@/lib/csv-parser';
   import { db } from '@/lib/spine-db';
   import * as DocumentPicker from 'expo-document-picker';
   import * as FileSystem from 'expo-file-system/legacy';

   async function handleImport() {
     // Pick file
     const result = await DocumentPicker.getDocumentAsync({
       type: 'text/csv',
     });
     
     if (result.canceled) return;
     
     // Read file
     const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
     
     // Parse and import
     const importResult = await importAppCloseCSV(content, result.assets[0].name);
     
     // Save to database
     // ... (implement bulk insert)
   }
   ```

3. **Test with Real Data**
   - Copy `/home/ubuntu/upload/alltextsfvf-appclose%202025.csv` to your test device
   - Import it
   - Verify 630 messages in database
   - Check for duplicates (re-import should skip all)

**Acceptance Criteria:**
- [ ] Import tab added to app
- [ ] Can pick CSV file
- [ ] Progress indicator shows during import
- [ ] 630 messages imported successfully
- [ ] Re-import skips duplicates (0 new messages)

---

### Phase 3: Spine Viewer (Priority 3)

**Goal:** Display the spine in chronological order (read-only).

**Tasks:**

1. **Create Spine Viewer Component** (`components/spine/SpineViewer.tsx`)
   - FlatList with spine items sorted by timestamp
   - Each item shows:
     - Date/time
     - Sender → Recipient
     - Message preview (first 100 chars)
     - Platform badge (SMS, AppClose, etc.)
     - Category badge (color-coded)
   - Pull-to-refresh
   - Search by keyword, date range, counterpart

2. **Add Spine Tab** (`app/(tabs)/spine.tsx`)
   - Use SpineViewer component
   - Add filter controls (date range, counterpart, category)
   - Add "Create Timeline Event" button (disabled for now)

3. **Performance Optimization**
   - Use `getItemLayout` for FlatList
   - Implement windowing (only render visible items)
   - Test with 630 messages - should scroll smoothly

**Acceptance Criteria:**
- [ ] Spine viewer displays all 630 messages
- [ ] Sorted chronologically (oldest first)
- [ ] Smooth scrolling performance
- [ ] Search works (keyword, date, counterpart)
- [ ] Pull-to-refresh reloads from database

---

### Phase 4: Manual Promotion Bridge (Priority 4)

**Goal:** Select spine items and create timeline events from them.

**Tasks:**

1. **Add Selection Mode to Spine Viewer**
   - Long-press to enter selection mode
   - Checkboxes appear on each item
   - Select multiple items
   - "Create Timeline Event" button at bottom

2. **Create Timeline Event Form** (`components/spine/PromoteToTimeline.tsx`)
   - Pre-filled with:
     - Date: from selected spine items
     - Title: (user enters)
     - Description: (user enters)
     - Lane: (user selects)
     - Status: defaults to 'asserted'
     - spine_refs: array of selected spine item IDs
   - Show preview of selected messages
   - Save button creates TimelineEvent in database

3. **Update Timeline Grid**
   - Timeline grid now queries from database (not hardcoded)
   - Events with `spine_refs` show a link icon
   - Tap event → see linked spine items

**Acceptance Criteria:**
- [ ] Can select multiple spine items
- [ ] "Create Timeline Event" opens form
- [ ] Form pre-fills date from spine items
- [ ] Saved event appears in timeline grid
- [ ] Event links back to spine items (spine_refs array)

---

### Phase 5: Sticky Notes (Priority 5)

**Goal:** Add private annotations to events and spine items.

**Tasks:**

1. **Create Sticky Note Component** (`components/sticky-notes/StickyNoteEditor.tsx`)
   - Text input (multiline)
   - Color picker (yellow, pink, blue, green)
   - Private toggle (default: ON)
   - Save/Cancel buttons

2. **Add Sticky Note Button**
   - Timeline events: "Add Note" button in event editor
   - Spine items: "Add Note" button in spine viewer

3. **Display Sticky Notes**
   - Timeline: show note icon on events with notes
   - Spine: show note icon on items with notes
   - Tap icon → view/edit note

4. **Export Control**
   - When exporting timeline, show option: "Include private notes?"
   - Default: NO
   - If YES, show warning: "Private notes will be visible in export"

**Acceptance Criteria:**
- [ ] Can add sticky note to timeline event
- [ ] Can add sticky note to spine item
- [ ] Notes default to private (is_private: true)
- [ ] Export timeline excludes private notes by default
- [ ] Can opt-in to include notes in export

---

### Phase 6: Dry-Run Validation (Priority 6)

**Goal:** Verify the system can rebuild from files.

**Tasks:**

1. **Create Validation Script** (`scripts/dry-run-validation.ts`)
   ```typescript
   // 1. Import CSV → save to database
   // 2. Export database state to JSON
   // 3. Delete database
   // 4. Re-import CSV
   // 5. Export database state to JSON again
   // 6. Compare: should be identical
   ```

2. **Run Validation**
   - Execute script
   - Verify: message count matches
   - Verify: hashes match
   - Verify: timestamps match

3. **Document Results**
   - Create `DRY_RUN_RESULTS.md`
   - Include: pass/fail, message count, hash comparison
   - If failed: document discrepancies

**Acceptance Criteria:**
- [ ] Dry-run script completes without errors
- [ ] Re-import produces identical database state
- [ ] All 630 messages match exactly
- [ ] Results documented in DRY_RUN_RESULTS.md

---

## 🔧 Implementation Tips

### Database Queries

```typescript
// Get all spine items for a counterpart
const items = await db.spine
  .where('counterpart')
  .equals('Paige')
  .sortBy('timestamp');

// Get spine items in date range
const items = await db.spine
  .where('timestamp')
  .between('2024-11-01T00:00:00Z', '2024-12-01T00:00:00Z')
  .toArray();

// Get timeline events with spine refs
const events = await db.timeline
  .where('spine_refs')
  .notEqual([])
  .toArray();
```

### SHA-256 Hashing (Production)

Replace the placeholder hash function with proper crypto:

```typescript
import * as Crypto from 'expo-crypto';

export async function calculateHash(content: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    content
  );
}
```

### Performance Optimization

```typescript
// Use getItemLayout for FlatList
getItemLayout={(data, index) => ({
  length: 80, // item height
  offset: 80 * index,
  index,
})}

// Use windowing
windowSize={10}
maxToRenderPerBatch={10}
updateCellsBatchingPeriod={50}
```

---

## 📂 File Structure

```
case-timeline-mobile/
├── types/
│   ├── spine.ts ✅ (Done)
│   └── timeline.ts (Existing)
├── lib/
│   ├── csv-parser.ts ✅ (Done)
│   ├── spine-db.ts ⏳ (You build this)
│   └── timeline-context.tsx (Existing)
├── components/
│   ├── spine/
│   │   ├── SpineViewer.tsx ⏳
│   │   └── PromoteToTimeline.tsx ⏳
│   ├── sticky-notes/
│   │   └── StickyNoteEditor.tsx ⏳
│   └── timeline/ (Existing)
├── app/(tabs)/
│   ├── spine.tsx ⏳
│   ├── import.tsx ⏳
│   └── index.tsx (Existing)
└── scripts/
    └── dry-run-validation.ts ⏳
```

---

## 🧪 Testing Checklist

Before you commit:

- [ ] Import 630 messages from CSV
- [ ] Re-import same CSV → 0 duplicates
- [ ] Search spine by keyword
- [ ] Filter spine by date range
- [ ] Select 3 spine items → create timeline event
- [ ] Timeline event shows link to spine items
- [ ] Add sticky note to event (private)
- [ ] Export timeline → note NOT included
- [ ] Export timeline with notes → note included
- [ ] Delete database → re-import → verify identical
- [ ] No console errors
- [ ] App doesn't crash

---

## 🚨 Critical Invariants (DO NOT BREAK)

1. **NEVER edit `content_original`** - It's immutable truth
2. **NEVER auto-populate `content_neutral`** - Only human summaries
3. **Default sticky notes to private** - Opt-in to export
4. **Hash check before import** - Prevent duplicates
5. **spine_refs is the bridge** - Events reference spine, don't duplicate

---

## 📞 Questions?

If you get stuck:

1. Check `types/spine.ts` for data model reference
2. Check `lib/csv-parser.ts` for parsing examples
3. Test with small dataset first (10 messages)
4. Use Dexie DevTools to inspect database

---

## 🎉 Success Criteria

You're done when:

✅ 630 messages imported from CSV  
✅ Spine viewer displays all messages  
✅ Can create timeline event from spine items  
✅ Sticky notes work (private by default)  
✅ Dry-run validation passes  
✅ No data loss on re-import  
✅ App is fast and responsive  

---

## 📦 Next Steps After Completion

1. **Push to GitHub** (Prose_Truth_Repo)
2. **Create checkpoint** in Manus
3. **Start using for real case** (import full dataset)
4. **Build timeline** for court filings
5. **Export for attorney review**

---

**Good luck! You've got this. The hard part (data model) is done. Now it's just UI and wiring.** 🚀
