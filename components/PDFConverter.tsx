import React, { useState } from 'react';

export const PDFConverter: React.FC = () => {
    const [converting, setConverting] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [pastedText, setPastedText] = useState('');

    const handleTextConvert = () => {
        if (!pastedText.trim()) {
            alert('Please paste some text first');
            return;
        }

        setConverting(true);

        // Create CSV from pasted text
        const csvHeader = 'event_id,date,event_type,short_title,description,source,exhibit_refs,reliability,notes\n';
        const csvRow = `PASTE-${Date.now()},${new Date().toISOString().split('T')[0]},DOCUMENT,"Pasted Text","${pastedText.substring(0, 2000).replace(/"/g, '""').replace(/\n/g, ' ')}","Manual Paste","PASTE-${Date.now()}",High,"Pasted from clipboard"`;

        const csvContent = csvHeader + csvRow;
        setResult(csvContent);
        setConverting(false);
    };

    const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            alert('Please select a file');
            return;
        }

        setConverting(true);
        setResult(null);

        try {
            // Handle TXT files (NotebookLM exports, etc.)
            if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                const text = await file.text();

                // Create CSV format from text
                const csvHeader = 'event_id,date,event_type,short_title,description,source,exhibit_refs,reliability,notes\n';
                const csvRow = `TXT-${Date.now()},${new Date().toISOString().split('T')[0]},DOCUMENT,"${file.name}","${text.substring(0, 2000).replace(/"/g, '""').replace(/\n/g, ' ')}","NotebookLM Export","TXT-${Date.now()}",High,"Imported from ${file.name}"`;

                const csvContent = csvHeader + csvRow;
                setResult(csvContent);
                setConverting(false);
                return;
            }

            // Handle PDF files
            if (file.type !== 'application/pdf') {
                alert('Please select a PDF or TXT file');
                setConverting(false);
                return;
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdfjsLib = (window as any).pdfjsLib;

            if (!pdfjsLib) {
                alert('PDF library not loaded. Please refresh the page.');
                setConverting(false);
                return;
            }

            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += `Page ${i}:\n${pageText}\n\n`;
            }

            // Create CSV format
            const csvHeader = 'event_id,date,event_type,short_title,description,source,exhibit_refs,reliability,notes\n';
            const csvRow = `PDF-${Date.now()},${new Date().toISOString().split('T')[0]},DOCUMENT,"${file.name}","${fullText.substring(0, 1000).replace(/"/g, '""').replace(/\n/g, ' ')}","PDF Import","PDF-${Date.now()}",Medium,"Extracted from ${file.name}"`;

            const csvContent = csvHeader + csvRow;
            setResult(csvContent);
        } catch (err) {
            alert('Failed to convert file. Please try a different file.');
            console.error('Conversion Error:', err);
        } finally {
            setConverting(false);
        }
    };

    const downloadCSV = () => {
        if (!result) return;

        const blob = new Blob([result], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted_${Date.now()}.csv`;
        a.click();
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        alert('CSV copied to clipboard!');
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <h2 className="text-2xl font-black uppercase tracking-tight">PDF → CSV Converter</h2>
                    <p className="text-blue-100 text-sm mt-1">Extract text from PDFs and convert to CSV format</p>
                </div>

                <div className="p-8 space-y-6">
                    {/* Paste Text Section */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                        <h3 className="text-sm font-black uppercase text-green-800 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            Paste Text (NotebookLM, etc.)
                        </h3>
                        <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Paste your NotebookLM output, text messages, or any text here..."
                            className="w-full h-40 p-4 border-2 border-green-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-green-500 bg-white"
                        />
                        <button
                            onClick={handleTextConvert}
                            disabled={!pastedText.trim()}
                            className="mt-3 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold uppercase tracking-wide hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Convert Pasted Text to CSV
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 border-t border-slate-300"></div>
                        <span className="text-xs font-bold text-slate-500 uppercase">Or Upload File</span>
                        <div className="flex-1 border-t border-slate-300"></div>
                    </div>

                    {/* File Upload Section */}
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                        <input
                            type="file"
                            accept=".pdf,.txt"
                            onChange={handlePDFUpload}
                            className="hidden"
                            id="pdf-upload"
                        />
                        <label htmlFor="pdf-upload" className="cursor-pointer">
                            <div className="space-y-3">
                                <svg className="w-16 h-16 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <div>
                                    <p className="text-lg font-bold text-slate-700">Click to upload PDF</p>
                                    <p className="text-sm text-slate-500">Court orders, police reports, medical records, etc.</p>
                                </div>
                            </div>
                        </label>
                    </div>

                    {converting && (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-600 font-medium">Extracting text from PDF...</p>
                        </div>
                    )}

                    {result && !converting && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-black uppercase text-slate-700">CSV Output</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={copyToClipboard}
                                            className="px-4 py-2 bg-slate-700 text-white rounded-lg text-xs font-bold uppercase hover:bg-slate-600 transition-colors"
                                        >
                                            Copy
                                        </button>
                                        <button
                                            onClick={downloadCSV}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase hover:bg-blue-700 transition-colors"
                                        >
                                            Download CSV
                                        </button>
                                    </div>
                                </div>
                                <pre className="text-xs font-mono bg-white p-4 rounded border border-slate-200 overflow-x-auto max-h-64 overflow-y-auto">
                                    {result}
                                </pre>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-800 font-medium">
                                    ✅ <strong>Next step:</strong> Download this CSV, then import it using the "Import Evidence" button in The Vault tab.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <h4 className="text-xs font-black uppercase text-slate-700 mb-3">How It Works</h4>
                        <ol className="space-y-2 text-sm text-slate-600">
                            <li className="flex gap-2">
                                <span className="font-bold text-blue-600">1.</span>
                                <span>Upload a PDF document (court order, police report, etc.)</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-blue-600">2.</span>
                                <span>Text is automatically extracted from all pages</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-blue-600">3.</span>
                                <span>Converted to CSV format with proper columns</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-blue-600">4.</span>
                                <span>Download or copy the CSV, then import to The Vault</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};
