import React, { useState } from 'react';
import type { NavRoute, ReportRecord, WorkspaceState } from '../types.ts';

interface DataAnalysisViewProps {
  workspace: WorkspaceState;
  onNavigateToCopilot: (prefill?: string) => void;
}

export const DataAnalysisView: React.FC<DataAnalysisViewProps> = ({
  workspace,
  onNavigateToCopilot,
}) => {
  const [regionFilter, setRegionFilter] = useState<'all' | 'US-East' | 'Midwest' | 'South' | 'West'>('all');

  const regionalRows = [
    { region: 'US-East', sla: '95.8%', velocity: '+14%', cycleDays: '3.2d', status: 'Optimal' },
    { region: 'Midwest', sla: '94.2%', velocity: '+12%', cycleDays: '3.6d', status: 'Recovered' },
    { region: 'South', sla: '92.9%', velocity: '+8%', cycleDays: '4.1d', status: 'Nominal' },
    { region: 'West', sla: '93.7%', velocity: '+11%', cycleDays: '3.8d', status: 'Nominal' },
  ].filter((r) => regionFilter === 'all' || r.region === regionFilter);

  return (
    <div className="flex flex-col w-full px-4 py-4 gap-4">
      <section className="flex flex-col gap-1.5 pt-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Operational Telemetry • 4 Territories
        </span>
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">
          Analytics &amp; Metrics
        </h1>
        <p className="text-[13px] text-slate-500">
          Regional SLA fulfillment, sprint throughput, and cycle latency breakdown.
        </p>
      </section>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {(['all', 'US-East', 'Midwest', 'South', 'West'] as const).map((reg) => (
          <button
            key={reg}
            type="button"
            onClick={() => setRegionFilter(reg)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
              regionFilter === reg
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {reg === 'all' ? 'All Regions' : reg}
          </button>
        ))}
      </div>

      <section className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900">
            Regional SLA &amp; Throughput Matrix
          </span>
          <span className="text-[11px] text-slate-500 tabular-nums">
            Composite: {workspace.metrics.efficiency.value}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/60">
                <th className="py-2.5 px-4">Territory</th>
                <th className="py-2.5 px-4 text-right">SLA Rate</th>
                <th className="py-2.5 px-4 text-right">Velocity</th>
                <th className="py-2.5 px-4 text-right">Cycle Time</th>
                <th className="py-2.5 px-4 text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {regionalRows.map((row) => (
                <tr key={row.region} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{row.region}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                    {row.sla}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 font-medium">
                    {row.velocity}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                    {row.cycleDays}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[11px] font-medium text-slate-700">{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-900">
            Need a territory variance breakdown?
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Run a custom correlation query with Executive Copilot.
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            onNavigateToCopilot(
              'Compare Midwest and US-East SLA recovery drivers and identify next cycle risks.'
            )
          }
          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium shrink-0"
        >
          Analyze in Copilot
        </button>
      </div>
    </div>
  );
};

interface ReportsViewProps {
  workspace: WorkspaceState;
  onGenerateReport: (topic: string, category: string) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  workspace,
  onGenerateReport,
  onShowToast,
}) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Operations');
  const [creating, setCreating] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportRecord | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await onGenerateReport(
        topic.trim() || 'Executive Operational Snapshot',
        category
      );
      setTopic('');
      onShowToast('Executive report generated and archived.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 py-4 gap-4">
      <section className="flex flex-col gap-1.5 pt-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Executive Archive • {workspace.reports.length} Documents
        </span>
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">
          Reports &amp; Digests
        </h1>
        <p className="text-[13px] text-slate-500">
          Generated briefings, quarterly models, and automated operational summaries.
        </p>
      </section>

      <form
        onSubmit={handleCreate}
        className="rounded-xl bg-white border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row gap-2"
      >
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Report title (e.g., Q3 Fulfillment & Retention Review)..."
          className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
        >
          <option value="Operations">Operations</option>
          <option value="Growth">Growth</option>
          <option value="Governance">Governance</option>
        </select>
        <button
          type="submit"
          disabled={creating}
          className="h-9 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 shrink-0"
        >
          {creating ? 'Generating...' : 'Generate Digest'}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-3">
        {workspace.reports.map((rep) => (
          <article
            key={rep.id}
            className="rounded-xl bg-white border border-slate-200 p-4 shadow-xs flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="font-semibold text-slate-700 uppercase">{rep.category}</span>
                <span>·</span>
                <span>{rep.updatedAt}</span>
                <span>·</span>
                <span className="font-mono">{rep.pages} pages</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveReport(rep)}
                className="text-blue-600 font-semibold hover:underline"
              >
                Open brief
              </button>
            </div>
            <h2 className="text-sm font-bold text-slate-900">{rep.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{rep.summary}</p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Prepared by {rep.author}
            </div>
          </article>
        ))}
      </div>

      {activeReport && (
        <div
          onClick={() => setActiveReport(null)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {activeReport.category} · {activeReport.pages} pages
              </span>
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900">{activeReport.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{activeReport.summary}</p>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Key Takeaways
              </div>
              <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                {activeReport.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="px-3.5 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SettingsViewProps {
  workspace: WorkspaceState;
  onSavePreferences: (prefs: {
    workspaceName: string;
    region: string;
    digestCadence: 'Daily' | 'Weekly' | 'Real-time';
  }) => Promise<void>;
  onNavigate: (route: NavRoute) => void;
  onShowToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  workspace,
  onSavePreferences,
  onNavigate,
  onShowToast,
}) => {
  const [workspaceName, setWorkspaceName] = useState(workspace.preferences.workspaceName);
  const [region, setRegion] = useState(workspace.preferences.region);
  const [digestCadence, setDigestCadence] = useState(workspace.preferences.digestCadence);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSavePreferences({ workspaceName, region, digestCadence });
      onShowToast('Workspace preferences saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 py-4 gap-4 max-w-2xl mx-auto">
      <section className="flex flex-col gap-1.5 pt-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Administration
        </span>
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Preferences</h1>
        <p className="text-[13px] text-slate-500">
          Configure workspace identity, briefing cadence, and access governance shortcuts.
        </p>
      </section>

      <form
        onSubmit={handleSave}
        className="rounded-xl bg-white border border-slate-200 p-4 shadow-xs space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Workspace Name
          </label>
          <input
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Primary Tier &amp; Region
          </label>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Executive Digest Cadence
          </label>
          <select
            value={digestCadence}
            onChange={(e) =>
              setDigestCadence(e.target.value as 'Daily' | 'Weekly' | 'Real-time')
            }
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
          >
            <option value="Real-time">Real-time</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('user-management')}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Manage Team &amp; Security Policies
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
