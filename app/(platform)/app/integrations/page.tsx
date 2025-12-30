'use client';

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { 
  useGetIntegrationProvidersQuery, 
  useGetIntegrationStatusQuery,
  useGetApiKeysQuery,
  useLazyStartOAuthFlowQuery 
} from "@/lib/store/api";

export default function IntegrationsPage() {
  const { workspaceId } = useAuth();
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  const { data: providersData, isLoading: loadingProviders } = useGetIntegrationProvidersQuery();
  const { data: statusData, isLoading: loadingStatus } = useGetIntegrationStatusQuery(
    workspaceId!,
    { skip: !workspaceId }
  );
  const { data: apiKeysData, isLoading: loadingApiKeys } = useGetApiKeysQuery(
    workspaceId!,
    { skip: !workspaceId }
  );
  const [triggerOAuth] = useLazyStartOAuthFlowQuery();

  const providers = providersData?.providers || [];
  const integrations = statusData?.integrations || [];
  const apiKeys = apiKeysData?.api_keys || [];

  // Merge providers with status
  const connectors = providers.map(provider => {
    const status = integrations.find(i => i.provider === provider.id);
    return {
      name: provider.name,
      id: provider.id,
      category: "Accounting",
      status: status?.connected ? "Connected" : "Available",
      sync: status?.connected ? "On demand" : "Not connected",
      description: `Connect ${provider.name} to sync your financial data.`,
      connected_at: status?.connected_at,
    };
  });

  // Add placeholder connectors for UI completeness
  const allConnectors = [
    ...connectors,
    {
      name: "Salesforce",
      id: "salesforce",
      category: "CRM",
      status: "Coming soon",
      sync: "Planned Q1",
      description: "Pulls pipeline stages, ARR, and forecasted close dates into scenarios.",
    },
    {
      name: "NetSuite",
      id: "netsuite",
      category: "ERP",
      status: "Coming soon",
      sync: "Planned Q2",
      description: "Enterprise-grade integration for subsidiaries and consolidations.",
    },
  ];

  const handleConnect = async (providerId: string) => {
    if (!workspaceId) return;
    try {
      const result = await triggerOAuth({ provider: providerId, workspace_id: workspaceId }).unwrap();
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      }
    } catch (err) {
      console.error("Failed to start OAuth:", err);
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Integrations Hub</h1>
            <p className="text-sm text-slate-400 mt-1">
              Connect accounting, CRM, and data platforms to keep forecasts in sync.
            </p>
          </div>
          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-slate-950 transition-all hover:bg-cyan-50 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            Request Connector
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm">
          <div className="flex flex-col gap-2 mb-6">
             <h2 className="text-lg font-bold text-white">API Access</h2>
             <p className="text-xs text-slate-400">
                Use the FyiCast API to push and pull forecast data.
            </p>
          </div>
          
          <div className="grid gap-6">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Workspace ID
                </p>
                <button 
                  onClick={() => navigator.clipboard.writeText(workspaceId!)}
                  className="text-[10px] font-bold text-cyan-400 hover:text-white transition-colors"
                >
                  COPY
                </button>
              </div>
              <p className="font-mono text-sm text-white bg-white/5 rounded px-3 py-2 border border-white/5">
                {workspaceId || 'Loading...'}
              </p>
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between mb-2">
                 <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    API Keys ({apiKeys.length})
                </p>
              </div>
              {loadingApiKeys ? (
                <p className="text-sm text-slate-500">Loading API keys...</p>
              ) : apiKeys.length === 0 ? (
                <p className="text-sm text-slate-400">No API keys created yet. Create one to access the API programmatically.</p>
              ) : (
                <div className="space-y-2">
                  {apiKeys.slice(0, 3).map(key => (
                    <div key={key.id} className="flex items-center justify-between bg-white/5 rounded px-3 py-2 border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">{key.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{key.key_prefix}...</p>
                      </div>
                      <span className={`text-[10px] font-bold ${key.isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                        {key.isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[10px] text-amber-200/80 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Never share your API keys on the client-side.
              </p>
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-sm font-bold text-white">Webhooks Active</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Listening for forecast_publish, scenario_approval, and sync_complete events.
              </p>
              <button className="mt-3 text-xs font-bold text-cyan-400 hover:text-white transition-colors">
                Manage Endpoints →
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm">
          <div className="flex flex-col gap-2 mb-6">
             <h2 className="text-lg font-bold text-white">Connected Systems</h2>
             <p className="text-xs text-slate-400">
                {loadingProviders || loadingStatus ? 'Loading integrations...' : `${allConnectors.length} integrations available`}
            </p>
          </div>
          
          <div className="grid gap-4">
            {loadingProviders || loadingStatus ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
              </div>
            ) : (
              allConnectors.map((connector) => (
                <div
                  key={connector.name}
                  className="group relative flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-lg font-bold text-slate-500">
                          {connector.name[0]}
                       </div>
                       <div>
                          <h3 className="text-sm font-bold text-white">{connector.name}</h3>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{connector.category}</p>
                       </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        connector.status === "Connected"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : connector.status === "Available"
                            ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      }`}
                    >
                      {connector.status}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed pl-[52px]">
                      {connector.description}
                  </p>
                  
                  <div className="flex items-center justify-between pl-[52px] mt-1 text-[11px] text-slate-500 font-mono">
                      <span>Sync: {connector.sync}</span>
                  </div>
                  
                  {connector.status !== "Coming soon" && (
                    <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                          onClick={() => connector.status === "Available" && handleConnect(connector.id)}
                          className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors"
                       >
                          {connector.status === "Connected" ? "Manage" : "Connect"}
                       </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
