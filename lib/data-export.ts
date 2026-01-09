import { db } from './spine-db';

/**
 * Export all case data to JSON for backup or portability
 */
export async function exportCaseData(): Promise<string> {
    const data = {
        version: '1.0',
        sources: await db.sources.toArray(),
        spine: await db.spine.toArray(),
        timeline: await db.timeline.toArray(),
        stickyNotes: await db.stickyNotes.toArray(),
        exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
}

/**
 * Import case data from JSON
 * @param json - Exported case data
 * @param mode - 'merge' adds to existing data, 'replace' clears first
 */
export async function importCaseData(
    json: string,
    mode: 'merge' | 'replace' = 'merge'
): Promise<{
    imported: {
        sources: number;
        spine: number;
        timeline: number;
        stickyNotes: number;
    };
    errors: string[];
}> {
    const errors: string[] = [];
    const imported = {
        sources: 0,
        spine: 0,
        timeline: 0,
        stickyNotes: 0,
    };

    try {
        const data = JSON.parse(json);

        // Validate format
        if (!data.version || !data.exportedAt) {
            throw new Error('Invalid export format - missing version or timestamp');
        }

        // Clear existing data if replace mode
        if (mode === 'replace') {
            await db.sources.clear();
            await db.spine.clear();
            await db.timeline.clear();
            await db.stickyNotes.clear();
        }

        // Import sources
        if (data.sources && Array.isArray(data.sources)) {
            try {
                await db.sources.bulkPut(data.sources);
                imported.sources = data.sources.length;
            } catch (e) {
                errors.push(`Sources import failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        }

        // Import spine items
        if (data.spine && Array.isArray(data.spine)) {
            try {
                await db.spine.bulkPut(data.spine);
                imported.spine = data.spine.length;
            } catch (e) {
                errors.push(`Spine import failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        }

        // Import timeline events
        if (data.timeline && Array.isArray(data.timeline)) {
            try {
                await db.timeline.bulkPut(data.timeline);
                imported.timeline = data.timeline.length;
            } catch (e) {
                errors.push(`Timeline import failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        }

        // Import sticky notes
        if (data.stickyNotes && Array.isArray(data.stickyNotes)) {
            try {
                await db.stickyNotes.bulkPut(data.stickyNotes);
                imported.stickyNotes = data.stickyNotes.length;
            } catch (e) {
                errors.push(`Sticky notes import failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        }

        return { imported, errors };
    } catch (error) {
        errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return { imported, errors };
    }
}

/**
 * Download case data as JSON file
 */
export function downloadCaseData(json: string, filename?: string): void {
    const name = filename || `casecraft-export-${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Generate NotebookLM master source file
 */
export async function generateNotebookLMSource(): Promise<string> {
    const sources = await db.sources.toArray();
    const spine = await db.spine.toArray();

    const header = `--- CASECRAFT MASTER CASE SPINE ---
GEN_DATE: ${new Date().toISOString()}
SOURCE_FILES: ${sources.length}
SPINE_ITEMS: ${spine.length}
----------------------------------

`;

    const items = spine.map((item, i) => {
        return `[SPINE ITEM #${i + 1}]
ID: ${item.id}
TIMESTAMP: ${item.timestamp}
HASH: ${item.sha256Fingerprint}
${item.counterpart ? `COUNTERPART: ${item.counterpart}` : ''}
${item.platform ? `PLATFORM: ${item.platform}` : ''}
${item.category ? `CATEGORY: ${item.category}` : ''}
---
${item.contentOriginal}
${item.contentNeutral ? `\n[NEUTRAL SUMMARY]\n${item.contentNeutral}` : ''}

`;
    }).join('\n');

    return header + items;
}

/**
 * Download NotebookLM source file
 */
export function downloadNotebookLMSource(content: string): void {
    const filename = `NotebookLM_Source_Master_${Date.now()}.txt`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
