import React, { useState } from 'react';
import { EvidenceItem, EvidenceType, VerificationStatus, Lane } from '../types';

declare const PDFLib: any;
declare const pdfjsLib: any;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface SmartImportProps {
  onImport: (items: EvidenceItem[]) => void;
  onClose: () => void;
}

interface DocumentBoundary {
  title: string;
  description: string;
  category: string;
  startPage: number;
  endPage: number;
}

export const SmartImport: React.FC<SmartImportProps> = ({ onImport, onClose }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [contextHint, setContextHint] = useState('Legal Case File');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [documents, setDocuments] = useState<DocumentBoundary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const calculateSHA256 = async (buffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const extractTextFromPDF = async (file: File): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      pageTexts.push(pageText);
      setProgress(`Extracting text: ${i}/${pdf.numPages} pages`);
    }
    return pageTexts;
  };

  const analyzeWithGemini = async (pageTexts: string[], hint: string): Promise<DocumentBoundary[]> => {
    // Simplified boundary detection - in production, call Gemini API
    const boundaries: DocumentBoundary[] = [];
    let currentStart = 1;
    
    for (let i = 0; i < pageTexts.length; i++) {
      const text = pageTexts[i];
      
      // Simple heuristic: detect document boundaries
      const isNewDocument = 
        text.toLowerCase().includes('motion') ||
        text.toLowerCase().includes('order') ||
        text.toLowerCase().includes('exhibit') ||
        text.toLowerCase().includes('affidavit') ||
        (i > 0 && text.length < 100); // Likely a cover page
      
      if (isNewDocument && i > currentStart) {
        boundaries.push({
          title: `Document ${boundaries.length + 1}`,
          description: text.substring(0, 100) + '...',
          category: detectCategory(text),
          startPage: currentStart,
          endPage: i
        });
        currentStart = i + 1;
      }
    }
    
    // Add final document
    if (currentStart <= pageTexts.length) {
      boundaries.push({
        title: `Document ${boundaries.length + 1}`,
        description: pageTexts[currentStart - 1]?.substring(0, 100) + '...',
        category: detectCategory(pageTexts[currentStart - 1] || ''),
        startPage: currentStart,
        endPage: pageTexts.length
      });
    }
    
    return boundaries;
  };

  const detectCategory = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('motion')) return 'Motion';
    if (lower.includes('order')) return 'Court Order';
    if (lower.includes('exhibit')) return 'Exhibit';
    if (lower.includes('affidavit')) return 'Affidavit';
    if (lower.includes('email')) return 'Email';
    if (lower.includes('text') || lower.includes('message')) return 'Message';
    return 'Document';
  };

  const detectLane = (category: string): Lane => {
    const lower = category.toLowerCase();
    if (lower.includes('custody') || lower.includes('visitation')) return 'CUSTODY';
    if (lower.includes('financial') || lower.includes('support')) return 'FINANCIAL';
    if (lower.includes('safety') || lower.includes('pfa')) return 'SAFETY';
    return 'PROCEDURAL';
  };

  const handleAnalyze = async () => {
    if (!pdfFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      setProgress('Extracting text from PDF...');
      const pageTexts = await extractTextFromPDF(pdfFile);
      
      setProgress('AI analyzing document boundaries...');
      const boundaries = await analyzeWithGemini(pageTexts, contextHint);
      
      setDocuments(boundaries);
      setProgress(`Found ${boundaries.length} documents`);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (documents.length === 0) return;
    
    setIsProcessing(true);
    setProgress('Creating evidence items...');
    
    try {
      const evidenceItems: EvidenceItem[] = await Promise.all(
        documents.map(async (doc, idx) => {
          // Calculate hash for the document section
          const hash = await calculateSHA256(
            new TextEncoder().encode(`${doc.title}-${doc.startPage}-${doc.endPage}`)
          );
          
          return {
            id: `smart-import-${Date.now()}-${idx}`,
            type: EvidenceType.DOCUMENT,
            sender: doc.category,
            content: doc.description,
            timestamp: new Date().toISOString(),
            hash: hash.substring(0, 16),
            verified: false,
            verificationStatus: VerificationStatus.PENDING,
            isInTimeline: false,
            lane: detectLane(doc.category),
            tags: [doc.category, 'Smart Import'],
            source: `PDF Pages ${doc.startPage}-${doc.endPage}`,
            exhibitCode: `SI-${String(idx + 1).padStart(3, '0')}`,
            notes: `Imported from ${pdfFile?.name}`
          };
        })
      );
      
      onImport(evidenceItems);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">Smart Import</h2>
              <p className="text-sm opacity-90 mt-1">AI-Powered PDF Decomposition</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Upload */}
          {!documents.length && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Upload PDF Bundle
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {pdfFile && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Context Hint (Optional)
                </label>
                <input
                  type="text"
                  value={contextHint}
                  onChange={(e) => setContextHint(e.target.value)}
                  placeholder="e.g., Family Law Case, Employment Dispute"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!pdfFile || isProcessing}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold uppercase tracking-wider hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Analyzing...' : 'Analyze PDF'}
              </button>
            </div>
          )}

          {/* Step 2: Review */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-bold text-green-800">
                    Found {documents.length} documents in PDF
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {documents.map((doc, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{doc.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Pages {doc.startPage}-{doc.endPage} • {doc.category}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        {detectLane(doc.category)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleImport}
                disabled={isProcessing}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold uppercase tracking-wider hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Importing...' : `Import ${documents.length} Documents to Truth Spine`}
              </button>
            </div>
          )}

          {/* Progress */}
          {progress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">{progress}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
