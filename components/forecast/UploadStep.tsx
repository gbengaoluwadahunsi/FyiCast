'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGetHistoricalRowsQuery } from '@/lib/store/api';

interface UploadStepProps {
  workspaceId: string;
  onDataUploaded: (data: any) => void;
  onNext: () => void;
  importing: boolean;
  importCSV: any;
}

type ManualEntry = {
  period: string;
  revenue: number;
  cogs: number;
  opex: number;
  personnel: number;
};

export function UploadStep({
  workspaceId,
  onDataUploaded,
  onNext,
  importing,
  importCSV,
}: UploadStepProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'integrations'>('upload');
  const [csvContent, setCsvContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Manual entry state
  const [manualEntry, setManualEntry] = useState<ManualEntry>({
    period: '',
    revenue: 0,
    cogs: 0,
    opex: 0,
    personnel: 0,
  });
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([]);

  // Check if data already exists
  const { data: existingData, isLoading: loadingExisting } = useGetHistoricalRowsQuery(workspaceId);
  const hasExistingData = (existingData?.rows?.length || 0) > 0 || (existingData?.count || 0) > 0;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = useCallback(async (file: File) => {
    const reader = new FileReader();
    
    return new Promise<string>((resolve, reject) => {
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (files.length === 0) {
      setError('Please upload CSV or Excel files (.csv, .xlsx, .xls)');
      return;
    }

    setUploadedFiles(prev => [...prev, ...files]);

    for (const file of files) {
      if (file.name.endsWith('.csv')) {
        try {
          const content = await processFile(file);
          setCsvContent(prev => prev + '\n' + content);
        } catch (err) {
          setError(`Failed to read ${file.name}`);
        }
      }
    }
  }, [processFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    setError(null);

    for (const file of files) {
      if (file.name.endsWith('.csv')) {
        try {
          const content = await processFile(file);
          setCsvContent(prev => prev + '\n' + content);
        } catch (err) {
          setError(`Failed to read ${file.name}`);
        }
      }
    }
  }, [processFile]);

  const handleImport = async () => {
    if (!csvContent.trim()) {
      setError('Please upload or paste CSV data first');
      return;
    }

    setError(null);
    try {
      await importCSV({
        workspace_id: workspaceId,
        csv_data: csvContent,
      }).unwrap();
      
      setSuccess(true);
      onDataUploaded({ files: uploadedFiles, csvContent });
    } catch (err: any) {
      setError(err.data?.error || 'Import failed');
    }
  };

  const handleManualImport = async () => {
    if (manualEntries.length === 0) {
      setError('Please add at least one period of data');
      return;
    }

    // Convert manual entries to CSV format
    let csv = 'Date,Category,Amount\n';
    for (const entry of manualEntries) {
      if (entry.revenue > 0) csv += `${entry.period},REVENUE,${entry.revenue}\n`;
      if (entry.cogs > 0) csv += `${entry.period},COGS,${entry.cogs}\n`;
      if (entry.opex > 0) csv += `${entry.period},OPEX,${entry.opex}\n`;
      if (entry.personnel > 0) csv += `${entry.period},PERSONNEL,${entry.personnel}\n`;
    }

    setError(null);
    try {
      await importCSV({
        workspace_id: workspaceId,
        csv_data: csv,
      }).unwrap();
      
      setSuccess(true);
      onDataUploaded({ manualEntries });
    } catch (err: any) {
      setError(err.data?.error || 'Import failed');
    }
  };

  const addManualEntry = () => {
    if (!manualEntry.period) {
      setError('Please enter a period (e.g., 2024-01)');
      return;
    }
    setManualEntries(prev => [...prev, manualEntry]);
    setManualEntry({ period: '', revenue: 0, cogs: 0, opex: 0, personnel: 0 });
    setError(null);
  };

  const removeManualEntry = (index: number) => {
    setManualEntries(prev => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <span className="text-2xl">📤</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Import Financial Data</h2>
            <p className="text-sm text-slate-400">
              Upload, manually enter, or sync your historical financial data
            </p>
          </div>
        </div>
        
        {/* Show existing data indicator */}
        {hasExistingData && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium">Data exists - you can skip this step</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
        {[
          { id: 'upload', label: 'Upload CSV', icon: '📄' },
          { id: 'manual', label: 'Manual Entry', icon: '✍️' },
          { id: 'integrations', label: 'Integrations', icon: '🔗' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <>
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
              dragActive
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-white/10 bg-white/5 hover:border-cyan-500/30 hover:bg-white/10'
            }`}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform ${
                dragActive ? 'scale-110 bg-cyan-500/20' : 'bg-white/5'
              }`}>
                <svg className={`w-8 h-8 ${dragActive ? 'text-cyan-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  Drag & drop your files here
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  or click to browse • Supports CSV, XLSX, XLS
                </p>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm font-bold text-white mb-3">Uploaded Files</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📄</span>
                      <div>
                        <p className="text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual CSV Input */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Or Paste CSV Data</h3>
              <span className="text-xs text-slate-500">Format: Date, Category, Amount</span>
            </div>
            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Date,Category,Amount
2024-01,REVENUE,150000
2024-01,OPEX,45000
2024-02,REVENUE,165000
..."
              className="w-full h-40 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 font-mono outline-none transition focus:border-cyan-500/50 focus:bg-white/5 focus:ring-4 focus:ring-cyan-500/10"
            />
          </div>

          {/* Expected Format Guide */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">📋 Expected CSV Format</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-white">Column 1: Date</p>
                <p className="text-slate-400">YYYY-MM or YYYY-MM-DD</p>
              </div>
              <div>
                <p className="font-medium text-white">Column 2: Category</p>
                <p className="text-slate-400">REVENUE, COGS, OPEX, PERSONNEL</p>
              </div>
              <div>
                <p className="font-medium text-white">Column 3: Amount</p>
                <p className="text-slate-400">Number (e.g., 150000)</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          {/* Entry Form */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-bold text-white mb-4">Add Financial Period</h3>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Period</label>
                <input
                  type="text"
                  placeholder="2024-01"
                  value={manualEntry.period}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Revenue</label>
                <input
                  type="number"
                  placeholder="0"
                  value={manualEntry.revenue || ''}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">COGS</label>
                <input
                  type="number"
                  placeholder="0"
                  value={manualEntry.cogs || ''}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, cogs: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Operating Exp</label>
                <input
                  type="number"
                  placeholder="0"
                  value={manualEntry.opex || ''}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, opex: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Personnel</label>
                <input
                  type="number"
                  placeholder="0"
                  value={manualEntry.personnel || ''}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, personnel: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
            <button
              onClick={addManualEntry}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              + Add Period
            </button>
          </div>

          {/* Entries Table */}
          {manualEntries.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left">Period</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-right">COGS</th>
                    <th className="px-4 py-3 text-right">OpEx</th>
                    <th className="px-4 py-3 text-right">Personnel</th>
                    <th className="px-4 py-3 text-right">Gross Profit</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {manualEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-white">{entry.period}</td>
                      <td className="px-4 py-3 text-right text-slate-300">${entry.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-300">${entry.cogs.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-300">${entry.opex.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-300">${entry.personnel.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-400">
                        ${(entry.revenue - entry.cogs).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => removeManualEntry(index)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {manualEntries.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
              <p className="text-slate-400">No periods added yet. Use the form above to add financial data.</p>
            </div>
          )}
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: 'QuickBooks', icon: '📗', color: 'emerald', desc: 'Sync your QuickBooks data automatically' },
            { name: 'Xero', icon: '📘', color: 'blue', desc: 'Connect to Xero for automatic imports' },
            { name: 'Stripe', icon: '💳', color: 'violet', desc: 'Import revenue data from Stripe' },
          ].map((integration) => (
            <div
              key={integration.name}
              className={`rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all cursor-pointer group`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{integration.icon}</span>
                <h3 className="text-lg font-bold text-white">{integration.name}</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">{integration.desc}</p>
              <button className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors group-hover:border-cyan-500/30">
                Connect →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          ✅ Data imported successfully! Click "Next" to continue.
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {activeTab === 'upload' && uploadedFiles.length > 0 && `${uploadedFiles.length} file(s) ready`}
          {activeTab === 'manual' && manualEntries.length > 0 && `${manualEntries.length} period(s) ready`}
        </div>
        <div className="flex gap-3">
          {activeTab === 'upload' && (
            <button
              onClick={handleImport}
              disabled={importing || (!csvContent.trim() && uploadedFiles.length === 0)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-slate-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"></span>
                  Importing...
                </>
              ) : (
                <>Import Data</>
              )}
            </button>
          )}
          {activeTab === 'manual' && (
            <button
              onClick={handleManualImport}
              disabled={importing || manualEntries.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-slate-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"></span>
                  Importing...
                </>
              ) : (
                <>Import {manualEntries.length} Period(s)</>
              )}
            </button>
          )}
          <button
            onClick={onNext}
            disabled={!success && !hasExistingData}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-cyan-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasExistingData && !success ? 'Skip & Continue →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
