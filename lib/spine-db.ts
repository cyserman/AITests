import Dexie, { Table } from 'dexie';

// Type definitions based on Spine System specifications
export interface SourceFile {
    id: string;
    fileName: string;
    fileHash: string;
    importedAt: string;
    fileType: 'csv' | 'pdf' | 'txt' | 'docx' | 'json' | 'msg';
    recordCount: number;
}

export interface SpineItem {
    id: string;
    sourceId: string;
    timestamp: string;
    counterpart?: string;
    platform?: 'SMS' | 'AppClose' | 'Email' | 'WhatsApp' | 'Other';
    category?: MessageCategory;
    contentOriginal: string; // IMMUTABLE - never edit
    contentNeutral?: string; // Human-written summary only
    sha256Fingerprint: string;
    createdAt: string;

    // Additional metadata from TruthDock
    fileName?: string;
    lastModified?: number;
    type: 'text' | 'voice' | 'file' | 'message' | 'document' | 'incident';
    verified: boolean;
    confidence?: number;
    lane?: 'CUSTODY' | 'FINANCIAL' | 'SAFETY' | 'PROCEDURAL';
    tags?: string[];
    exhibitCode?: string;
    reliability?: string;
    source?: string;
}

export enum MessageCategory {
    ACCESS_DENIED = 'Access_Denied',
    FINANCIAL_STRAIN = 'Financial_Strain',
    HOT_READ_REACTIVE = 'Hot_Read_Reactive',
    CUSTODY_DISPUTE = 'Custody_Dispute',
    COMMUNICATION_BLOCKED = 'Communication_Blocked',
    MEDICAL_CONCERN = 'Medical_Concern',
    SAFETY_ISSUE = 'Safety_Issue',
    PROCEDURAL = 'Procedural',
    OTHER = 'Other'
}

export interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    description: string;
    lane: 'CUSTODY' | 'FINANCIAL' | 'SAFETY' | 'PROCEDURAL';
    status: EventStatus;
    spineRefs: string[]; // Array of SpineItem IDs
    createdAt: string;
}

export enum EventStatus {
    ASSERTED = 'asserted',
    DENIED = 'denied',
    WITHDRAWN = 'withdrawn',
    PENDING = 'pending',
    RESOLVED = 'resolved',
    FACT = 'fact'
}

export interface StickyNote {
    id: string;
    targetType: 'spine' | 'timeline' | 'evidence';
    targetId: string;
    text: string;
    color: 'yellow' | 'pink' | 'blue' | 'green';
    isPrivate: boolean; // Default: true
    createdAt: string;
    x?: number; // For floating position
    y?: number;
}

/**
 * CaseCraft Spine Database
 * 
 * IndexedDB storage via Dexie.js for high-performance evidence management.
 * Replaces localStorage for better querying and scalability (630+ items).
 */
export class SpineDatabase extends Dexie {
    sources!: Table<SourceFile, string>;
    spine!: Table<SpineItem, string>;
    timeline!: Table<TimelineEvent, string>;
    stickyNotes!: Table<StickyNote, string>;

    constructor() {
        super('CaseCraftSpineDB');

        this.version(1).stores({
            sources: 'id, fileHash, importedAt, fileType',
            spine: 'id, sourceId, timestamp, counterpart, platform, category, sha256Fingerprint, createdAt, type, lane',
            timeline: 'id, date, lane, status, createdAt',
            stickyNotes: 'id, targetType, targetId, createdAt, isPrivate',
        });
    }
}

// Export singleton instance
export const db = new SpineDatabase();

/**
 * Migration utility: Copy data from localStorage to Dexie
 */
export async function migrateFromLocalStorage(): Promise<{
    migrated: number;
    skipped: number;
}> {
    let migrated = 0;
    let skipped = 0;

    try {
        // Check for old CaseCraft state
        const oldState = localStorage.getItem('CASE_CRAFT_STATE_V3');
        if (oldState) {
            const { evidence, notes, narrative } = JSON.parse(oldState);

            // Migrate evidence items to spine
            if (evidence && Array.isArray(evidence)) {
                for (const item of evidence) {
                    const existing = await db.spine.get(item.id);
                    if (!existing) {
                        await db.spine.add({
                            id: item.id,
                            sourceId: 'legacy-migration',
                            timestamp: item.timestamp,
                            counterpart: item.sender,
                            contentOriginal: item.content,
                            contentNeutral: item.contentNeutral,
                            sha256Fingerprint: item.hash || '',
                            createdAt: new Date().toISOString(),
                            fileName: item.exhibitCode,
                            type: item.type?.toLowerCase() || 'document',
                            verified: item.verified,
                            confidence: 0.9,
                            lane: item.lane,
                            tags: item.tags || [],
                            exhibitCode: item.exhibitCode,
                            reliability: item.reliability,
                            source: item.source,
                        });
                        migrated++;
                    } else {
                        skipped++;
                    }
                }
            }

            // Migrate sticky notes
            if (notes && Array.isArray(notes)) {
                for (const note of notes) {
                    const existing = await db.stickyNotes.get(note.id);
                    if (!existing) {
                        await db.stickyNotes.add({
                            id: note.id,
                            targetType: note.targetId ? 'spine' : 'evidence',
                            targetId: note.targetId || '',
                            text: note.text,
                            color: 'yellow',
                            isPrivate: true,
                            createdAt: new Date().toISOString(),
                            x: note.x,
                            y: note.y,
                        });
                        migrated++;
                    } else {
                        skipped++;
                    }
                }
            }

            // Migrate narrative events to timeline
            if (narrative && Array.isArray(narrative)) {
                for (const event of narrative) {
                    const existing = await db.timeline.get(event.id);
                    if (!existing) {
                        await db.timeline.add({
                            id: event.id,
                            date: event.timestamp,
                            title: event.title,
                            description: event.description,
                            lane: event.lane,
                            status: EventStatus.ASSERTED,
                            spineRefs: event.linkedEvidenceIds || [],
                            createdAt: new Date().toISOString(),
                        });
                        migrated++;
                    } else {
                        skipped++;
                    }
                }
            }
        }

        // Check for TruthDock spine
        const truthdockSpine = localStorage.getItem('truthdock_spine');
        if (truthdockSpine) {
            const notes = JSON.parse(truthdockSpine);
            if (Array.isArray(notes)) {
                for (const note of notes) {
                    const existing = await db.spine.get(note.id);
                    if (!existing) {
                        await db.spine.add({
                            id: note.id,
                            sourceId: 'truthdock-migration',
                            timestamp: new Date(note.timestamp).toISOString(),
                            contentOriginal: note.rawContent || note.content,
                            contentNeutral: note.content !== note.rawContent ? note.content : undefined,
                            sha256Fingerprint: note.hash || '',
                            createdAt: new Date().toISOString(),
                            fileName: note.fileName,
                            lastModified: note.lastModified,
                            type: note.type,
                            verified: note.isVerified || false,
                            confidence: note.confidence,
                            lane: note.lane as any,
                        });
                        migrated++;
                    } else {
                        skipped++;
                    }
                }
            }
        }

        return { migrated, skipped };
    } catch (error) {
        console.error('Migration error:', error);
        return { migrated, skipped };
    }
}

/**
 * Clear all data (for testing/dry-run validation)
 */
export async function clearAllData(): Promise<void> {
    await db.sources.clear();
    await db.spine.clear();
    await db.timeline.clear();
    await db.stickyNotes.clear();
}

/**
 * Export database state to JSON (for dry-run validation)
 */
export async function exportDatabaseState(): Promise<string> {
    const state = {
        sources: await db.sources.toArray(),
        spine: await db.spine.toArray(),
        timeline: await db.timeline.toArray(),
        stickyNotes: await db.stickyNotes.toArray(),
        exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(state, null, 2);
}
