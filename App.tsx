
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SpineView } from './components/SpineView';
import { TimelineView } from './components/TimelineView';
import { StickyNotesView } from './components/StickyNotesView';
import { AIAnalysisView } from './components/AIAnalysisView';
import { KnowledgeBase } from './components/KnowledgeBase';
import { MotionBuilder } from './components/MotionBuilder';
import { SmartSticky } from './components/SmartSticky';
import { FloatingEvidenceConsole } from './components/FloatingEvidenceConsole';
import { LiveAdvocateView } from './components/LiveAdvocateView';
import { PDFConverter } from './components/PDFConverter';
import { ActiveLayer, EvidenceItem, EvidenceType, StickyNote, VerificationStatus, NarrativeEvent, Lane } from './types';

// Your actual case data
const YOUR_CASE_DATA: EvidenceItem[] = [
    {
        id: 'EVT-0001',
        type: EvidenceType.DOCUMENT,
        sender: 'PFA order filed',
        content: 'Protection From Abuse order filed. Includes EPFA and follow-on PFA activity.',
        timestamp: '2024-11-01T00:00:00.000Z',
        hash: 'uggtxf',
        verified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        isInTimeline: true,
        exhibitCode: 'PKT-001',
        lane: 'PROCEDURAL',
        tags: ['PFA'],
        reliability: 'High',
        source: 'Court filings',
        notes: 'Removal and leverage origin point. Evidence includes filings, orders, CY-48 context, text deletions.'
    },
    {
        id: 'EVT-0002',
        type: EvidenceType.INCIDENT,
        sender: 'Camper incident',
        content: 'Law enforcement involved. Custody interference and setup alleged.',
        timestamp: '2024-11-23T00:00:00.000Z',
        hash: 'fhuxng',
        verified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        isInTimeline: true,
        exhibitCode: 'EVT-0002',
        lane: 'CUSTODY',
        tags: ['INCIDENT'],
        reliability: 'High',
        source: 'Law enforcement reports'
    },
    {
        id: 'EVT-0003',
        type: EvidenceType.INCIDENT,
        sender: 'July 4th exchange incident',
        content: 'Selective enforcement and rigidity demonstrated in holiday exchange.',
        timestamp: '2024-07-04T00:00:00.000Z',
        hash: 'qnak0d',
        verified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        isInTimeline: true,
        exhibitCode: 'CL-003',
        lane: 'CUSTODY',
        tags: ['EXCHANGE'],
        reliability: 'High',
        source: 'Call logs',
        notes: 'Evidence includes communications, missed/blocked exchanges.'
    },
    {
        id: 'EVT-0004',
        type: EvidenceType.DOCUMENT,
        sender: 'Counsel withdrawal',
        content: 'Legal counsel withdrew from representation. Procedural disadvantage resulted.',
        timestamp: '2024-12-01T00:00:00.000Z',
        hash: '79jril',
        verified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        isInTimeline: true,
        exhibitCode: 'EVT-0004',
        lane: 'PROCEDURAL',
        tags: ['COURT'],
        reliability: 'High',
        source: 'Court records',
        notes: 'Evidence includes correspondence, docket entries, absence of filings.'
    },
    {
        id: 'EVT-0005',
        type: EvidenceType.INCIDENT,
        sender: 'Christmas holiday denial',
        content: 'Christmas holiday access denied. Status quo hardening demonstrated.',
        timestamp: '2024-12-25T00:00:00.000Z',
        hash: '95cw31',
        verified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        isInTimeline: true,
        exhibitCode: 'EVT-0005',
        lane: 'CUSTODY',
        tags: ['EXCHANGE'],
        reliability: 'High',
        source: 'Call logs',
        notes: 'Evidence includes call logs, AppClose blocks, holiday denial records.'
    }
];

export default function App() {
    const [activeLayer, setActiveLayer] = useState<ActiveLayer>(ActiveLayer.SPINE);
    const [evidence, setEvidence] = useState<EvidenceItem[]>(YOUR_CASE_DATA);
    const [narrativeEvents, setNarrativeEvents] = useState<NarrativeEvent[]>([]);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);

    // Auto-save to localStorage
    useEffect(() => {
        const saved = localStorage.getItem('CASE_CRAFT_SIMPLE');
        if (saved) {
            try {
                const { evidence: sE, notes: sN, narrative: sNav } = JSON.parse(saved);
                if (sE && sE.length > 0) setEvidence(sE);
                if (sN) setStickyNotes(sN);
                if (sNav) setNarrativeEvents(sNav);
            } catch (e) {
                console.error("Failed to load saved data", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('CASE_CRAFT_SIMPLE', JSON.stringify({
            evidence,
            notes: stickyNotes,
            narrative: narrativeEvents
        }));
    }, [evidence, stickyNotes, narrativeEvents]);

    const updateEvidence = (updated: EvidenceItem) => {
        setEvidence(prev => prev.map(item => item.id === updated.id ? updated : item));
    };

    const toggleTimeline = (id: string) => {
        setEvidence(prev => prev.map(item =>
            item.id === id ? { ...item, isInTimeline: !item.isInTimeline } : item
        ));
    };

    const addStickyNote = () => {
        const newNote: StickyNote = {
            id: Date.now().toString(),
            text: '',
            x: 100 + (stickyNotes.length * 20),
            y: 100 + (stickyNotes.length * 20)
        };
        setStickyNotes([...stickyNotes, newNote]);
    };

    const parseCSV = (text: string) => {
        const re = /(?!\s*$)\s*(?:'([^']*)'|"([^"]*)"|([^,]*))(?:,|$)/g;
        const rows = [];
        const lines = text.split(/\r?\n/);
        for (let line of lines) {
            if (!line.trim()) continue;
            const row = [];
            let match;
            while ((match = re.exec(line)) !== null) {
                row.push(match[1] || match[2] || match[3] || '');
            }
            rows.push(row);
        }
        return rows;
    };

    const handleImportCSV = (csvContent: string) => {
        const rows = parseCSV(csvContent);
        if (rows.length < 2) return;

        const headers = rows[0].map(h => h.toLowerCase().trim());

        const newItems: EvidenceItem[] = rows.slice(1).map((parts, idx) => {
            if (parts.length < 3) return null;

            const getVal = (name: string) => {
                const index = headers.indexOf(name);
                return index > -1 ? parts[index]?.trim() : '';
            };

            const dateStr = getVal('date');
            const timestamp = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
            const typeStr = getVal('event_type').toUpperCase();

            const type = (Object.values(EvidenceType).includes(typeStr as EvidenceType))
                ? typeStr as EvidenceType
                : EvidenceType.INCIDENT;

            return {
                id: getVal('event_id') || `imp-${Date.now()}-${idx}`,
                type,
                sender: getVal('short_title') || 'Imported Event',
                content: getVal('description') || parts[2] || '',
                timestamp,
                hash: Math.random().toString(36).substring(7),
                verified: false,
                verificationStatus: VerificationStatus.PENDING,
                isInTimeline: false,
                lane: 'CUSTODY' as Lane,
                tags: [],
                source: getVal('source'),
                reliability: getVal('reliability'),
                notes: getVal('notes'),
                exhibitCode: getVal('exhibit_refs')
            };
        }).filter(Boolean) as EvidenceItem[];

        setEvidence(prev => [...prev, ...newItems]);
        alert(`✅ Imported ${newItems.length} events`);
    };

    const renderContent = () => {
        switch (activeLayer) {
            case ActiveLayer.SPINE:
                return <SpineView evidence={evidence} onToggleTimeline={toggleTimeline} onUpdateEvidence={updateEvidence} />;
            case ActiveLayer.TIMELINE:
                return <TimelineView
                    evidence={evidence.filter(e => e.isInTimeline)}
                    narrativeEvents={narrativeEvents}
                    onUpdateEvidence={updateEvidence}
                    onUpdateNarrative={setNarrativeEvents}
                />;
            case ActiveLayer.NOTES:
                return <StickyNotesView evidence={evidence} onUpdateNotes={(id, notes) => {
                    const item = evidence.find(e => e.id === id);
                    if (!item) return;
                    updateEvidence({ ...item, notes });
                }} />;
            case ActiveLayer.AI:
                return <AIAnalysisView evidence={evidence} />;
            case ActiveLayer.LIVE:
                return <LiveAdvocateView evidence={evidence} />;
            case ActiveLayer.KNOWLEDGE:
                return <KnowledgeBase />;
            case ActiveLayer.MOTIONS:
                return <MotionBuilder evidence={evidence.filter(e => e.isInTimeline && (e.contentNeutral || e.content))} />;
            case ActiveLayer.PDF_CONVERTER:
                return <PDFConverter />;
            default:
                return <Dashboard evidence={evidence} />;
        }
    };

    return (
        <Layout
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            isSidebarOpen={isSidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onImport={handleImportCSV}
            onOpenConsole={() => setIsConsoleOpen(true)}
        >
            <div className="p-6 h-full overflow-y-auto relative bg-[#f8fafc]">
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-bold text-green-800">✅ Your case data is loaded: {evidence.length} events</p>
                    <p className="text-xs text-green-600 mt-1">All changes auto-save to localStorage</p>
                </div>

                {renderContent()}

                <button
                    onClick={addStickyNote}
                    className="fixed bottom-8 right-24 w-14 h-14 bg-yellow-400 text-yellow-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-[999] border-4 border-white"
                    title="Add Sticky Note"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>

                {isConsoleOpen && <FloatingEvidenceConsole evidence={evidence} onClose={() => setIsConsoleOpen(false)} />}

                {stickyNotes.map(note => (
                    <SmartSticky
                        key={note.id}
                        {...note}
                        onUpdate={(updated) => setStickyNotes(prev => prev.map(n => n.id === updated.id ? updated : n))}
                        onDelete={(id) => setStickyNotes(prev => prev.filter(n => n.id !== id))}
                    />
                ))}
            </div>
        </Layout>
    );
}
