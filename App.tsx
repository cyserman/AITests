
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
import { TruthDockPanel } from './components/TruthDockPanel';
import { ActiveLayer, EvidenceItem, EvidenceType, StickyNote, VerificationStatus, NarrativeEvent, Lane } from './types';

const MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: '1',
    type: EvidenceType.INCIDENT,
    sender: 'Observation',
    content: "The mother refused to allow visitation despite the signed agreement.",
    timestamp: '2025-12-15T15:00:00Z',
    hash: '4d8a1...f32',
    verified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    isInTimeline: true,
    exhibitCode: 'Ex-A-01',
    lane: 'CUSTODY',
    tags: ['VISITATION', 'REFUSAL'],
    reliability: 'High',
    source: 'Parent Observation'
  },
  {
    id: '2',
    type: EvidenceType.DOCUMENT,
    sender: 'Vehicle Report',
    content: "Vehicle failure during custody exchange in Montgomery County.",
    timestamp: '2025-12-17T10:00:00Z',
    hash: '9e1a2...b11',
    verified: true,
    verificationStatus: VerificationStatus.PENDING,
    isInTimeline: true,
    exhibitCode: 'Ex-C-04',
    lane: 'PROCEDURAL',
    tags: ['LOGISTICS', 'TRANSPORT'],
    reliability: 'Medium',
    source: 'Maintenance Log'
  }
];

export default function App() {
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>(ActiveLayer.SPINE);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(MOCK_EVIDENCE);
  const [narrativeEvents, setNarrativeEvents] = useState<NarrativeEvent[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isTruthDockOpen, setIsTruthDockOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('CASE_CRAFT_STATE_V3');
    if (saved) {
      try {
        const { evidence: sE, notes: sN, narrative: sNav } = JSON.parse(saved);
        setEvidence(sE || MOCK_EVIDENCE);
        setStickyNotes(sN || []);
        setNarrativeEvents(sNav || []);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('CASE_CRAFT_STATE_V3', JSON.stringify({ evidence, notes: stickyNotes, narrative: narrativeEvents }));
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

  /**
   * Robust CSV Parser handling quoted strings and commas
   */
  const parseCSV = (text: string) => {
    const re = /(?!\s*$)\s*(?:'([^']*)'|"([^"]*)"|([^,]*))\s*(?:,|$)/g;
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
    alert(`TruthTrack™ Sync Complete: ${newItems.length} records promoted to Vault.`);
  };

  const loadSampleMobileData = () => {
    const sample = `event_id,date,event_type,short_title,description,source,exhibit_refs,reliability,notes
M-001,2024-01-15,INCIDENT,Custody Conflict,"Refused exchange at Montgomery Mall. Statement: ""I don't care about the order.""",Parent Log,CL-01,High,Witness present
M-002,2024-01-16,MESSAGE,Blocked App,"Blocked on OurFamilyWizard after exchange conflict.",App History,OFW-05,Medium,Screened
M-003,2024-01-20,DOCUMENT,Medical Bill,"Unpaid medical invoice sent via email.",Email,FIN-22,High,Overdue`;
    handleImportCSV(sample);
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
      onOpenTruthDock={() => setIsTruthDockOpen(true)}
    >
      <div className="p-6 h-full overflow-y-auto relative bg-[#f8fafc]">
        {/* Mobile Sync Quick Action */}
        {activeLayer === ActiveLayer.SPINE && evidence.length <= 2 && (
          <div className="mb-6 p-4 bg-blue-600 rounded-xl shadow-lg text-white flex justify-between items-center animate-pulse">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Mobile Sync Pending</p>
                <p className="text-[10px] opacity-80">Populate the Truth Spine with normalized mobile data.</p>
              </div>
            </div>
            <button
              onClick={loadSampleMobileData}
              className="px-4 py-2 bg-white text-blue-600 rounded font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors"
            >
              Sync Sample
            </button>
          </div>
        )}

        {renderContent()}

        <button
          onClick={addStickyNote}
          className="fixed bottom-8 right-24 w-14 h-14 bg-yellow-400 text-yellow-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-[999] border-4 border-white"
          title="Add Sticky Note"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {isConsoleOpen && <FloatingEvidenceConsole evidence={evidence} onClose={() => setIsConsoleOpen(false)} />}
        {isTruthDockOpen && <TruthDockPanel isOpen={isTruthDockOpen} onClose={() => setIsTruthDockOpen(false)} />}

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
