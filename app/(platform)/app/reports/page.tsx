'use client';

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGetScenariosQuery, useLazyGeneratePDFReportQuery } from "@/lib/store/api";

// Default export templates - these would eventually come from the backend
const defaultTemplates = [
  {
    name: "Financial Summary",
    format: "PDF",
    description: "P&L summary, KPIs, and trend analysis.",
    icon: "📋"
  },
  {
    name: "Data Export",
    format: "CSV",
    description: "Raw financial data export for analysis.",
    icon: "💹"
  },
  {
    name: "Scenario Report",
    format: "Excel",
    description: "Scenario comparison with forecasts.",
    icon: "📊"
  },
];

export default function ReportsPage() {
  const { workspaceId, user } = useAuth();
  const { data: scenariosData } = useGetScenariosQuery(
    workspaceId!,
    { skip: !workspaceId }
  );
  const [generatePDF, { isLoading: generatingPDF }] = useLazyGeneratePDFReportQuery();

  const [includeScenarios, setIncludeScenarios] = useState(true);
  const [includeVariances, setIncludeVariances] = useState(true);
  const [fileType, setFileType] = useState<"pdf" | "xls" | "csv">("pdf");

  const scenarios = scenariosData?.scenarios || [];

  const handleGenerateReport = async () => {
    if (!workspaceId) return;
    
    try {
      const result = await generatePDF({ workspace_id: workspaceId }).unwrap();
      // Download the blob
      const url = window.URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fyicast-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  if (!workspaceId) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-white/5 bg-black/20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 pb-10">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-900/40 p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Reporting & Exports
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Package forecasts into shareable decks, spreadsheets, and data feeds.
            </p>
          </div>
          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-slate-950 transition-all hover:bg-cyan-50 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <span className="text-lg leading-none">+</span>
            Build New Template
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Quick Export</h2>
            <p className="text-xs text-slate-400 mt-1">
                Generate a one-off report using the latest approved forecast.
            </p>
          </div>
          
          <div className="grid gap-6">
            <div className="grid gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                File Format
              </p>
              <div className="inline-flex p-1 rounded-xl bg-black/20 border border-white/5">
                {[
                  { id: "pdf", label: "PDF Deck" },
                  { id: "xls", label: "Excel" },
                  { id: "csv", label: "CSV" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFileType(option.id as typeof fileType)}
                    type="button"
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      fileType === option.id
                        ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 transition hover:bg-white/10 hover:border-white/10">
                <span className="text-sm font-medium text-slate-200">Include scenario comparison tab</span>
                <div className={`relative h-5 w-9 rounded-full transition-colors ${includeScenarios ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                    <input
                        type="checkbox"
                        className="absolute h-full w-full cursor-pointer opacity-0"
                        checked={includeScenarios}
                        onChange={() => setIncludeScenarios((prev) => !prev)}
                    />
                    <span className={`absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition-transform ${includeScenarios ? 'translate-x-4' : ''}`} />
                </div>
                </label>
                
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 transition hover:bg-white/10 hover:border-white/10">
                <span className="text-sm font-medium text-slate-200">Include actuals vs plan variance</span>
                <div className={`relative h-5 w-9 rounded-full transition-colors ${includeVariances ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                    <input
                        type="checkbox"
                        className="absolute h-full w-full cursor-pointer opacity-0"
                        checked={includeVariances}
                        onChange={() => setIncludeVariances((prev) => !prev)}
                    />
                    <span className={`absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition-transform ${includeVariances ? 'translate-x-4' : ''}`} />
                </div>
                </label>
            </div>

            <div className="grid gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Distribution</p>
              <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Email to</span>
                  <span className="font-mono text-xs text-cyan-300">{user?.email || 'your@email.com'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Scenarios</span>
                  <span className="font-mono text-xs text-cyan-300">{scenarios.length} available</span>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={generatingPDF}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40 disabled:opacity-50"
            >
              {generatingPDF ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm">
          <div className="mb-6">
             <h2 className="text-lg font-bold text-white">Template Library</h2>
             <p className="text-xs text-slate-400 mt-1">
                Reusable templates aligned to your stakeholder expectations.
             </p>
          </div>
          
          <div className="grid gap-4">
            {defaultTemplates.map((template) => (
              <div
                key={template.name}
                className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-xl shadow-inner">
                        {template.icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {template.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[240px]">
                        {template.description}
                        </p>
                    </div>
                  </div>
                  <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                    {template.format}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 border-t border-white/5 pt-4 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    <span>{template.format} format</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                   <button className="rounded-lg bg-white py-2 text-xs font-bold text-slate-950 hover:bg-cyan-50">
                      Download
                   </button>
                   <button className="rounded-lg border border-white/10 bg-transparent py-2 text-xs font-bold text-white hover:bg-white/5">
                      Edit
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Scenarios Section */}
      {scenarios.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-lg font-bold text-white">
              Available Scenarios
            </h2>
            <p className="text-xs text-slate-400">
              Include scenarios in your reports for comprehensive analysis.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="relative flex h-full flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-6 transition hover:bg-white/10 hover:border-white/10"
              >
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-bold text-white">{scenario.name}</h3>
                   <div className={`h-2 w-2 rounded-full ${scenario.is_base_case ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.6)]' : 'bg-slate-400'}`}></div>
                </div>
                
                <div className="space-y-2">
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {scenario.description || 'No description provided'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{scenario.driver_count || 0} drivers</span>
                      <span>•</span>
                      <span>{new Date(scenario.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      scenario.is_base_case
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}
                  >
                    {scenario.is_base_case ? 'Base Case' : 'Variant'}
                  </span>
                  <button
                    type="button"
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Include in Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
