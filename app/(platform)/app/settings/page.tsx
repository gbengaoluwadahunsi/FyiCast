'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGetWorkspaceQuery } from "@/lib/store/api";

type WorkspaceMember = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
};

export default function SettingsPage() {
  const { workspaceId } = useAuth();
  const { data: workspaceData, isLoading } = useGetWorkspaceQuery(
    workspaceId!,
    { skip: !workspaceId }
  );

  const workspace = workspaceData?.workspace;
  const members = (workspaceData as any)?.members as WorkspaceMember[] || [];

  const [workspaceName, setWorkspaceName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [fiscalStart, setFiscalStart] = useState("2024-01-01");
  const [twoFactor, setTwoFactor] = useState(true);
  const [dataRetention, setDataRetention] = useState("36");

  // Sync backend data to local state
  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name || "");
      setCurrency(workspace.currency || "USD");
      // Convert fiscal_year_start (1-12) to a date
      const fiscalMonth = workspace.fiscal_year_start || 1;
      setFiscalStart(`2024-${String(fiscalMonth).padStart(2, '0')}-01`);
    }
  }, [workspace]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'ADMIN': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
      case 'EDITOR': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Workspace Settings</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage organization preferences, access, and security policies.
            </p>
          </div>
          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-slate-950 transition-all hover:bg-cyan-50 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            Save Changes
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Profile & Localization</h2>
            <p className="text-xs text-slate-400 mt-1">
                Configure default currency, fiscal calendar, and branding.
            </p>
          </div>
          
          <div className="grid gap-6">
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Workspace Name</span>
              <input
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:bg-black/30 focus:ring-4 focus:ring-cyan-500/10"
              />
            </label>
            
            <div className="grid grid-cols-2 gap-6">
                <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Base Currency</span>
                <div className="relative">
                    <select
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:bg-black/30 focus:ring-4 focus:ring-cyan-500/10"
                    >
                        <option value="USD">USD · US Dollar</option>
                        <option value="EUR">EUR · Euro</option>
                        <option value="GBP">GBP · Pound sterling</option>
                        <option value="MYR">MYR · Malaysian ringgit</option>
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                </label>
                
                <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Fiscal Year Start</span>
                <input
                    type="date"
                    value={fiscalStart}
                    onChange={(event) => setFiscalStart(event.target.value)}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:bg-black/30 focus:ring-4 focus:ring-cyan-500/10"
                />
                </label>
            </div>

            <div className="border-t border-white/5 pt-4">
                 <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Brand Accent</p>
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-cyan-500 ring-2 ring-white/20 ring-offset-2 ring-offset-slate-900"></div>
                    <div className="h-10 w-10 rounded-full bg-purple-500 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"></div>
                    <div className="h-10 w-10 rounded-full bg-emerald-500 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"></div>
                    <div className="h-10 w-10 rounded-full bg-rose-500 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"></div>
                    <div className="h-10 w-10 rounded-full border border-dashed border-white/30 flex items-center justify-center text-slate-400 text-lg cursor-pointer hover:text-white hover:border-white/50 transition-all">+</div>
                 </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Security & Compliance</h2>
            <p className="text-xs text-slate-400 mt-1">
                Keep sensitive financial data protected and audit-ready.
            </p>
          </div>
          
          <div className="grid gap-6">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-3 transition hover:bg-black/30">
              <div>
                <span className="block text-sm font-bold text-white">Enforce 2FA</span>
                <span className="text-xs text-slate-400">Require for all workspace members</span>
              </div>
              <div className={`relative h-6 w-11 rounded-full transition-colors ${twoFactor ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                <input
                    type="checkbox"
                    className="absolute h-full w-full cursor-pointer opacity-0"
                    checked={twoFactor}
                    onChange={() => setTwoFactor((prev) => !prev)}
                />
                <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${twoFactor ? 'translate-x-5' : ''}`} />
              </div>
            </label>
            
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Audit Log Retention (Months)</span>
              <input
                type="number"
                value={dataRetention}
                onChange={(event) => setDataRetention(event.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:bg-black/30 focus:ring-4 focus:ring-cyan-500/10"
              />
            </label>
            
            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-5">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Compliance Export
              </p>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Logs are retained for {dataRetention} months. Automated weekly reports sent to <span className="font-mono text-cyan-300">compliance@fyicast.com</span>.
              </p>
              <button className="mt-4 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20">
                Export Latest Log
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
                <h2 className="text-lg font-bold text-white">Team Members</h2>
                <p className="text-xs text-slate-400 mt-1">
                    Manage role-based access across finance, leadership, and advisors.
                </p>
            </div>
            <div className="flex gap-3">
                <button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-slate-200">
                    Invite Teammate
                </button>
                <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10">
                    Manage Groups
                </button>
            </div>
        </div>
        
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                <thead className="bg-black/20 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Permission</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        Loading team members...
                      </td>
                    </tr>
                ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No team members found
                      </td>
                    </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                            {getInitials(member.full_name)}
                        </div>
                        {member.full_name}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{member.email}</td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${getRoleColor(member.role)}`}>
                        {member.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-white font-bold text-xs transition-colors">
                        Edit
                        </button>
                    </td>
                    </tr>
                  ))
                )}
                </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
