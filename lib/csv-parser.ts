import { SpineItem, SourceFile, MessageCategory, db } from './spine-db';

/**
 * SHA-256 hash function for content fingerprinting
 */
async function calculateHash(content: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Categorize message content based on keywords and patterns
 */
function categorizeMessage(content: string): MessageCategory {
    const lower = content.toLowerCase();

    if (lower.includes('denied') || lower.includes('refuse') || lower.includes('won\'t let')) {
        return MessageCategory.ACCESS_DENIED;
    }
    if (lower.includes('money') || lower.includes('payment') || lower.includes('bill') || lower.includes('financial')) {
        return MessageCategory.FINANCIAL_STRAIN;
    }
    if (lower.includes('custody') || lower.includes('visitation') || lower.includes('parenting time')) {
        return MessageCategory.CUSTODY_DISPUTE;
    }
    if (lower.includes('blocked') || lower.includes('can\'t reach') || lower.includes('not responding')) {
        return MessageCategory.COMMUNICATION_BLOCKED;
    }
    if (lower.includes('medical') || lower.includes('doctor') || lower.includes('health')) {
        return MessageCategory.MEDICAL_CONCERN;
    }
    if (lower.includes('safety') || lower.includes('danger') || lower.includes('police')) {
        return MessageCategory.SAFETY_ISSUE;
    }
    if (lower.includes('court') || lower.includes('hearing') || lower.includes('filing')) {
        return MessageCategory.PROCEDURAL;
    }

    return MessageCategory.OTHER;
}

/**
 * Parse AppClose CSV export format
 * Expected columns: timestamp, sender, recipient, message, call_log
 */
export interface AppCloseCSVRow {
    timestamp: string;
    sender: string;
    recipient: string;
    message?: string;
    callLog?: string;
}

/**
 * Import result statistics
 */
export interface ImportResult {
    sourceFile: SourceFile;
    imported: number;
    duplicates: number;
    errors: number;
    errorMessages: string[];
}

/**
 * Parse CSV with proper handling of quoted strings and commas
 */
function parseCSV(text: string): string[][] {
    const regex = /(?!\s*$)\s*(?:'([^']*)'|"([^"]*)"|([^,]*))\s*(?:,|$)/g;
    const rows: string[][] = [];
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
        if (!line.trim()) continue;
        const row: string[] = [];
        let match;

        while ((match = regex.exec(line)) !== null) {
            row.push(match[1] || match[2] || match[3] || '');
        }

        if (row.length > 0) {
            rows.push(row);
        }
    }

    return rows;
}

/**
 * Import AppClose CSV conversation export
 * 
 * @param csvContent - Raw CSV file content
 * @param fileName - Original file name
 * @returns Import result with statistics
 */
export async function importAppCloseCSV(
    csvContent: string,
    fileName: string
): Promise<ImportResult> {
    const rows = parseCSV(csvContent);

    if (rows.length < 2) {
        throw new Error('CSV file must contain header row and at least one data row');
    }

    // Calculate file hash for deduplication
    const fileHash = await calculateHash(csvContent);

    // Check if source file already imported
    const existingSource = await db.sources
        .where('fileHash')
        .equals(fileHash)
        .first();

    if (existingSource) {
        return {
            sourceFile: existingSource,
            imported: 0,
            duplicates: rows.length - 1,
            errors: 0,
            errorMessages: ['File already imported - all records skipped as duplicates'],
        };
    }

    // Create source file record
    const sourceFile: SourceFile = {
        id: `source-${Date.now()}`,
        fileName,
        fileHash,
        importedAt: new Date().toISOString(),
        fileType: 'csv',
        recordCount: rows.length - 1,
    };

    await db.sources.add(sourceFile);

    // Parse headers
    const headers = rows[0].map(h => h.toLowerCase().trim());

    const getColumnIndex = (possibleNames: string[]): number => {
        for (const name of possibleNames) {
            const idx = headers.indexOf(name);
            if (idx !== -1) return idx;
        }
        return -1;
    };

    const timestampIdx = getColumnIndex(['timestamp', 'date', 'time', 'datetime']);
    const senderIdx = getColumnIndex(['sender', 'from', 'author']);
    const recipientIdx = getColumnIndex(['recipient', 'to', 'receiver']);
    const messageIdx = getColumnIndex(['message', 'content', 'text', 'body']);
    const callLogIdx = getColumnIndex(['call_log', 'call', 'calllog']);

    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    const errorMessages: string[] = [];

    // Process data rows
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        try {
            const timestamp = timestampIdx !== -1 ? row[timestampIdx]?.trim() : '';
            const sender = senderIdx !== -1 ? row[senderIdx]?.trim() : 'Unknown';
            const recipient = recipientIdx !== -1 ? row[recipientIdx]?.trim() : '';

            let content = '';
            let type: SpineItem['type'] = 'message';

            // Extract message or call log
            if (messageIdx !== -1 && row[messageIdx]?.trim()) {
                content = row[messageIdx].trim();
                type = 'message';
            } else if (callLogIdx !== -1 && row[callLogIdx]?.trim()) {
                content = row[callLogIdx].trim();
                type = 'voice';
            }

            if (!content) {
                errors++;
                errorMessages.push(`Row ${i + 1}: Empty content`);
                continue;
            }

            // Calculate content hash for deduplication
            const contentHash = await calculateHash(content);

            // Check for duplicate by hash
            const existingItem = await db.spine
                .where('sha256Fingerprint')
                .equals(contentHash)
                .first();

            if (existingItem) {
                duplicates++;
                continue;
            }

            // Parse timestamp
            let isoTimestamp: string;
            try {
                isoTimestamp = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
            } catch {
                isoTimestamp = new Date().toISOString();
            }

            // Determine counterpart (the other party in conversation)
            const counterpart = sender !== 'You' && sender !== 'Me' ? sender : recipient;

            // Categorize message
            const category = categorizeMessage(content);

            // Create spine item
            const spineItem: SpineItem = {
                id: `spine-${Date.now()}-${i}`,
                sourceId: sourceFile.id,
                timestamp: isoTimestamp,
                counterpart,
                platform: 'AppClose',
                category,
                contentOriginal: content,
                sha256Fingerprint: contentHash,
                createdAt: new Date().toISOString(),
                fileName: fileName,
                type,
                verified: false,
                confidence: 0.85,
                tags: [category],
            };

            await db.spine.add(spineItem);
            imported++;

        } catch (error) {
            errors++;
            errorMessages.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return {
        sourceFile,
        imported,
        duplicates,
        errors,
        errorMessages,
    };
}

/**
 * Import generic CSV with flexible column mapping
 * 
 * @param csvContent - Raw CSV file content
 * @param fileName - Original file name
 * @returns Import result with statistics
 */
export async function importGenericCSV(
    csvContent: string,
    fileName: string
): Promise<ImportResult> {
    const rows = parseCSV(csvContent);

    if (rows.length < 2) {
        throw new Error('CSV file must contain header row and at least one data row');
    }

    const fileHash = await calculateHash(csvContent);

    const existingSource = await db.sources
        .where('fileHash')
        .equals(fileHash)
        .first();

    if (existingSource) {
        return {
            sourceFile: existingSource,
            imported: 0,
            duplicates: rows.length - 1,
            errors: 0,
            errorMessages: ['File already imported'],
        };
    }

    const sourceFile: SourceFile = {
        id: `source-${Date.now()}`,
        fileName,
        fileHash,
        importedAt: new Date().toISOString(),
        fileType: 'csv',
        recordCount: rows.length - 1,
    };

    await db.sources.add(sourceFile);

    const headers = rows[0].map(h => h.toLowerCase().trim());

    const getVal = (row: string[], name: string) => {
        const index = headers.indexOf(name);
        return index > -1 ? row[index]?.trim() : '';
    };

    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    const errorMessages: string[] = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        try {
            const description = getVal(row, 'description') || row[2] || '';

            if (!description) {
                errors++;
                errorMessages.push(`Row ${i + 1}: Empty description`);
                continue;
            }

            const contentHash = await calculateHash(description);

            const existingItem = await db.spine
                .where('sha256Fingerprint')
                .equals(contentHash)
                .first();

            if (existingItem) {
                duplicates++;
                continue;
            }

            const dateStr = getVal(row, 'date');
            const timestamp = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

            const typeStr = getVal(row, 'event_type').toUpperCase();
            const type = ['MESSAGE', 'DOCUMENT', 'INCIDENT', 'EMAIL'].includes(typeStr)
                ? typeStr.toLowerCase() as SpineItem['type']
                : 'document';

            const spineItem: SpineItem = {
                id: getVal(row, 'event_id') || `spine-${Date.now()}-${i}`,
                sourceId: sourceFile.id,
                timestamp,
                contentOriginal: description,
                sha256Fingerprint: contentHash,
                createdAt: new Date().toISOString(),
                fileName: fileName,
                type,
                verified: false,
                confidence: 0.85,
                lane: getVal(row, 'lane') as any || undefined,
                tags: getVal(row, 'tags') ? getVal(row, 'tags').split(',').map(t => t.trim()) : [],
                exhibitCode: getVal(row, 'exhibit_refs'),
                reliability: getVal(row, 'reliability'),
                source: getVal(row, 'source'),
            };

            await db.spine.add(spineItem);
            imported++;

        } catch (error) {
            errors++;
            errorMessages.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return {
        sourceFile,
        imported,
        duplicates,
        errors,
        errorMessages,
    };
}
