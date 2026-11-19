import { useCallback, useEffect, useRef, useState } from 'react';
import { AiAssistantView } from './components/AiAssistantView.tsx';
import { AppShell } from './components/AppShell.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { DataAnalysisView, ReportsView, SettingsView } from './components/SecondaryViews.tsx';
import { SmartSuggestionsView } from './components/SmartSuggestionsView.tsx';
import { UserManagementView } from './components/UserManagementView.tsx';
import type {
  CopilotContext,
  MemberRole,
  NavRoute,
  SecuritySettings,
  WorkspaceState,
} from './types.ts';

async function apiJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export default function App() {
  const [activeRoute, setActiveRoute] = useState<NavRoute>('dashboard');
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copilotPrefill, setCopilotPrefill] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const fetchWorkspace = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiJson<WorkspaceState>('/api/workspace');
      setWorkspace(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load workspace.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWorkspace();
  }, [fetchWorkspace]);

  const handleNavigateToCopilot = useCallback((prefill?: string) => {
    if (prefill) {
      setCopilotPrefill(prefill);
    }
    setActiveRoute('ai-assistant');
  }, []);

  const handleExecuteDirective = async () => {
    const next = await apiJson<WorkspaceState>('/api/directive/execute', { method: 'POST' });
    setWorkspace(next);
  };

  const handleImportDataset = async (payload: {
    filename: string;
    recordCount: number;
    efficiencyDelta: number;
  }) => {
    const next = await apiJson<WorkspaceState>('/api/dataset/import', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setWorkspace(next);
  };

  const handleGenerateReport = async (topic?: string, category?: string) => {
    const res = await apiJson<{ state: WorkspaceState }>('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, category }),
    });
    setWorkspace(res.state);
  };

  const handleExecuteSuggestion = async (id: string) => {
    const next = await apiJson<WorkspaceState>(`/api/suggestions/${id}/execute`, {
      method: 'POST',
    });
    setWorkspace(next);
  };

  const handleBookmarkSuggestion = async (id: string) => {
    const next = await apiJson<WorkspaceState>(`/api/suggestions/${id}/bookmark`, {
      method: 'POST',
    });
    setWorkspace(next);
  };

  const handleSendChat = async (prompt: string, context: CopilotContext) => {
    const res = await apiJson<{ state: WorkspaceState }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
    setWorkspace(res.state);
  };

  const handleChatFeedback = async (id: string, feedback: 'up' | 'down' | null) => {
    const next = await apiJson<WorkspaceState>(`/api/chat/${id}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback }),
    });
    setWorkspace(next);
  };

  const handleInviteMember = async (email: string, role: MemberRole) => {
    const res = await apiJson<{ state: WorkspaceState }>('/api/members/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
    setWorkspace(res.state);
  };

  const handleUpdateRole = async (memberId: string, role: MemberRole) => {
    const next = await apiJson<WorkspaceState>(`/api/members/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    setWorkspace(next);
  };

  const handleResendInvite = async (memberId: string) => {
    const next = await apiJson<WorkspaceState>(`/api/members/${memberId}/resend`, {
      method: 'POST',
    });
    setWorkspace(next);
  };

  const handleUpdateSecurity = async (patch: Partial<SecuritySettings>) => {
    const next = await apiJson<WorkspaceState>('/api/security', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    setWorkspace(next);
  };

  const handleSavePreferences = async (prefs: {
    workspaceName: string;
    region: string;
    digestCadence: 'Daily' | 'Weekly' | 'Real-time';
  }) => {
    const next = await apiJson<WorkspaceState>('/api/preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    });
    setWorkspace(next);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
            B
          </div>
          <div className="text-xs font-medium text-slate-500">Loading Biz Assist workspace...</div>
        </div>
      </div>
    );
  }

  if (loadError || !workspace) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-xl border border-slate-200 p-5 text-center space-y-3 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Unable to load workspace</div>
          <p className="text-xs text-slate-500">{loadError || 'Workspace state unavailable.'}</p>
          <button
            type="button"
            onClick={() => void fetchWorkspace()}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      activeRoute={activeRoute}
      onNavigate={setActiveRoute}
      workspace={workspace}
      toastMessage={toastMessage}
      onDismissToast={() => setToastMessage(null)}
    >
      {activeRoute === 'dashboard' && (
        <DashboardView
          workspace={workspace}
          onNavigate={setActiveRoute}
          onExecuteDirective={handleExecuteDirective}
          onImportDataset={handleImportDataset}
          onGenerateReport={handleGenerateReport}
          onShowToast={showToast}
        />
      )}

      {activeRoute === 'smart-suggestions' && (
        <SmartSuggestionsView
          workspace={workspace}
          onExecuteSuggestion={handleExecuteSuggestion}
          onBookmarkSuggestion={handleBookmarkSuggestion}
          onNavigateToCopilot={handleNavigateToCopilot}
          onNavigate={setActiveRoute}
          onShowToast={showToast}
        />
      )}

      {activeRoute === 'ai-assistant' && (
        <AiAssistantView
          workspace={workspace}
          prefillPrompt={copilotPrefill}
          onClearPrefill={() => setCopilotPrefill(null)}
          onSendMessage={handleSendChat}
          onFeedback={handleChatFeedback}
          onNavigate={setActiveRoute}
          onShowToast={showToast}
        />
      )}

      {activeRoute === 'user-management' && (
        <UserManagementView
          workspace={workspace}
          onInviteMember={handleInviteMember}
          onUpdateRole={handleUpdateRole}
          onResendInvite={handleResendInvite}
          onUpdateSecurity={handleUpdateSecurity}
          onShowToast={showToast}
        />
      )}

      {activeRoute === 'data-analysis' && (
        <DataAnalysisView
          workspace={workspace}
          onNavigateToCopilot={handleNavigateToCopilot}
        />
      )}

      {activeRoute === 'reports' && (
        <ReportsView
          workspace={workspace}
          onGenerateReport={handleGenerateReport}
          onShowToast={showToast}
        />
      )}

      {activeRoute === 'settings' && (
        <SettingsView
          workspace={workspace}
          onSavePreferences={handleSavePreferences}
          onNavigate={setActiveRoute}
          onShowToast={showToast}
        />
      )}
    </AppShell>
  );
}
