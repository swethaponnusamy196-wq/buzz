import React, { useState } from 'react';
import type { NavRoute, SuggestionCategory, SuggestionItem, WorkspaceState } from '../types.ts';

interface SmartSuggestionsViewProps {
  workspace: WorkspaceState;
  onExecuteSuggestion: (id: string) => Promise<void>;
  onBookmarkSuggestion: (id: string) => Promise<void>;
  onNavigateToCopilot: (prefill?: string) => void;
  onNavigate: (route: NavRoute) => void;
  onShowToast: (msg: string) => void;
}

export const SmartSuggestionsView: React.FC<SmartSuggestionsViewProps> = ({
  workspace,
  onExecuteSuggestion,
  onBookmarkSuggestion,
  onNavigateToCopilot,
  onShowToast,
}) => {
  const [category, setCategory] = useState<SuggestionCategory>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inspectSuggestion, setInspectSuggestion] = useState<SuggestionItem | null>(null);

  const suggestions = workspace.suggestions;
  const filtered =
    category === 'all' ? suggestions : suggestions.filter((s) => s.category === category);

  const pendingCount = suggestions.filter((s) => !s.executed).length;
  const executedCount = suggestions.filter((s) => s.executed).length;
  const velocityPercent = Math.min(100, 82 + executedCount * 6);

  const handleExecute = async (item: SuggestionItem) => {
    setBusyId(item.id);
    try {
      await onExecuteSuggestion(item.id);
      onShowToast(
        item.executed
          ? `Paused "${item.title}".`
          : `Authorized and deployed "${item.title}".`
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleBookmark = async (item: SuggestionItem) => {
    await onBookmarkSuggestion(item.id);
    onShowToast(item.bookmarked ? 'Removed from saved briefs.' : 'Saved brief to bookmarks.');
  };

  const renderAbstractWithHighlight = (text: string, highlight: string) => {
    if (!highlight || !text.includes(highlight)) return text;
    const [before, ...rest] = text.split(highlight);
    return (
      <>
        {before}
        <strong className="font-semibold text-[#0F172A]">{highlight}</strong>
        {rest.join(highlight)}
      </>
    );
  };

  return (
    <div className="flex flex-col w-full px-4 py-4 gap-4">
      {/* Executive Header */}
      <section className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#E2E8F0] bg-white text-[#475569]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#334155]">
              Strategic Advisory Dispatch
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#64748B]">Q3 Review · Cycle 14</span>
        </div>
        <h1 className="font-headline text-[22px] font-bold text-[#0F172A] tracking-tight leading-tight mt-1">
          Operational &amp; Growth Levers
        </h1>
        <p className="text-xs text-[#475569] leading-relaxed">
          System-generated interventions vetted against historical enterprise KPIs and workflow
          latency patterns.
        </p>

        {/* Live Status Bar */}
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded bg-white border border-[#E2E8F0] mt-1 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[15px] text-[#0051d5]">verified</span>
            <span className="text-[#334155] font-medium text-[11px]">
              <strong className="text-[#0F172A] font-semibold">
                {pendingCount} Active Lever{pendingCount === 1 ? '' : 's'}
              </strong>{' '}
              pending authorization
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#64748B]">94% Confidence</span>
        </div>
      </section>

      {/* Horizontal Categorical Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-4 px-4">
        {[
          { key: 'all' as SuggestionCategory, label: `All Proposals (${suggestions.length})` },
          { key: 'growth' as SuggestionCategory, label: 'Client Retention & Growth' },
          { key: 'operational' as SuggestionCategory, label: 'Workflow Automation' },
          { key: 'governance' as SuggestionCategory, label: 'Governance & Ops' },
        ].map((tab) => {
          const active = category === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategory(tab.key)}
              className={`shrink-0 px-3 py-1.5 rounded text-xs transition-colors ${
                active
                  ? 'font-semibold bg-[#0F172A] text-white border border-[#0F172A]'
                  : 'font-medium bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Financial / Operational Cumulative Scoreboard */}
      <section className="rounded border border-[#E2E8F0] bg-white p-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#F1F5F9] flex items-center justify-center text-[#0F172A]">
              <span className="material-symbols-outlined text-[15px]">analytics</span>
            </div>
            <span className="font-headline text-xs font-bold uppercase tracking-wider text-[#334155]">
              Projected Cumulative Upside
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
            Run-Rate Basis
          </span>
        </div>

        <div className="grid grid-cols-2 divide-x divide-[#F1F5F9] py-3">
          <div className="pr-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#64748B] font-medium">Reclaimed Capacity</span>
              <span className="text-[10px] font-mono text-[#16A34A] font-semibold">
                +34% vs Base
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-2xl font-bold tracking-tight text-[#0F172A] tabular-nums">
                46.0
              </span>
              <span className="text-xs font-medium text-[#64748B]">hrs / mo</span>
            </div>
            <span className="text-[10px] text-[#64748B] block mt-1">
              Equivalent to 0.3 FTE equivalent
            </span>
          </div>

          <div className="pl-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#64748B] font-medium">ARR Capital Protected</span>
              <span className="text-[10px] font-mono text-[#0051d5] font-semibold">
                Tier 1 Target
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-2xl font-bold tracking-tight text-[#0F172A] tabular-nums">
                $14.2k
              </span>
              <span className="text-xs font-medium text-[#64748B]">ARR</span>
            </div>
            <span className="text-[10px] text-[#64748B] block mt-1">
              Based on 90-day churn modeling
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#F1F5F9] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#475569] font-medium">Pipeline Implementation Velocity</span>
            <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
              {velocityPercent}% Achieved
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded overflow-hidden">
            <div
              className="h-full bg-[#0F172A] rounded transition-all duration-300"
              style={{ width: `${velocityPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Recommendation Stream: Structured Executive Briefs */}
      <section className="grid grid-cols-1 gap-3.5">
        {filtered.length === 0 ? (
          <div className="rounded border border-[#E2E8F0] bg-white p-8 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-slate-400">
              fact_check
            </span>
            <div className="text-xs font-semibold text-slate-900">
              No proposals in this category yet
            </div>
            <p className="text-xs text-slate-500">
              Switch back to All Proposals or run a bespoke diagnostic with Executive Copilot.
            </p>
            <button
              type="button"
              onClick={() => setCategory('all')}
              className="mt-1 px-3 py-1.5 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Show All Proposals
            </button>
          </div>
        ) : (
          filtered.map((item) => (
            <article
              key={item.id}
              className="rounded border border-[#E2E8F0] bg-white p-3.5 shadow-xs flex flex-col transition-all hover:border-[#CBD5E1]"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      item.badgeStyle === 'blue'
                        ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]'
                        : 'bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]'
                    }`}
                  >
                    {item.badgeLabel}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                    {item.department}
                  </span>
                  {item.executed && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Deployed
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Bookmark suggestion"
                  onClick={() => void handleBookmark(item)}
                  className={`p-0.5 transition-colors ${
                    item.bookmarked ? 'text-[#0051d5]' : 'text-[#94A3B8] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {item.bookmarked ? 'bookmark' : 'bookmark_border'}
                  </span>
                </button>
              </div>

              <h2 className="font-headline text-[15px] font-bold text-[#0F172A] tracking-tight leading-snug">
                {item.title}
              </h2>

              <p className="text-xs text-[#334155] mt-1.5 leading-relaxed">
                {renderAbstractWithHighlight(item.abstract, item.highlightMetric)}
              </p>

              {item.quantMode === 'comparison' ? (
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#64748B]">
                      {item.beforeLabel}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span
                        className={`text-sm font-bold text-[#64748B] font-mono ${
                          item.id === 'sug-onboarding' ? 'line-through' : ''
                        }`}
                      >
                        {item.beforeValue}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8]">{item.beforeSubtext}</span>
                  </div>
                  <div className="flex flex-col border-l border-[#E2E8F0] pl-2.5">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#0051d5]">
                      {item.afterLabel}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-sm font-bold text-[#0F172A] font-mono">
                        {item.afterValue}
                      </span>
                      <span className="text-[10px] font-semibold text-[#16A34A]">
                        {item.afterDelta}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#475569]">{item.afterSubtext}</span>
                  </div>
                </div>
              ) : (
                <div className="my-3 p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                      {item.progressLabel}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#0051d5]">
                      {item.progressValue}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#0051d5] rounded"
                      style={{ width: `${item.progressPercent ?? 74}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#64748B]">{item.progressCaption}</span>
                </div>
              )}

              <div className="flex items-start gap-2 text-xs py-1.5 px-2 rounded bg-white border border-[#E2E8F0] mb-3">
                <span className="material-symbols-outlined text-[15px] text-[#64748B] shrink-0 mt-0.5">
                  {item.advisoryIcon}
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#64748B]">{item.advisorySource}</span>
                  <span className="text-[11px] text-[#334155] font-medium leading-tight">
                    {item.advisoryNote}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void handleExecute(item)}
                  className={`flex-1 py-2 px-3 rounded text-white text-xs font-semibold active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 ${
                    item.executed
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-[#0F172A] hover:bg-[#1E293B]'
                  }`}
                >
                  <span>
                    {item.executed ? 'Playbook Deployed' : item.primaryActionLabel}
                  </span>
                  <span className="material-symbols-outlined text-[15px]">
                    {item.executed ? 'check_circle' : 'arrow_forward'}
                  </span>
                </button>
                {item.secondaryActionLabel && (
                  <button
                    type="button"
                    onClick={() => setInspectSuggestion(item)}
                    className="py-2 px-3 rounded border border-[#CBD5E1] bg-white text-[#334155] text-xs font-semibold hover:bg-[#F8FAFC] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#64748B]">
                      {item.secondaryActionLabel === 'Model Risk' ? 'tune' : 'preview'}
                    </span>
                    <span>{item.secondaryActionLabel}</span>
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </section>

      {/* Institutional Advisory Request Box */}
      <aside className="flex items-center justify-between p-3 rounded border border-[#CBD5E1] bg-white shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center text-[#0F172A] shrink-0">
            <span className="material-symbols-outlined text-[18px]">terminal</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#0F172A]">Request Bespoke Diagnostic</span>
            <span className="text-[11px] text-[#64748B]">
              Run deep multi-variant analysis on custom dataset
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Request Diagnostic"
          onClick={() =>
            onNavigateToCopilot(
              'Run a multi-variant operational risk and capacity diagnostic across Q3 workflows.'
            )
          }
          className="p-1.5 rounded hover:bg-[#F1F5F9] text-[#0F172A] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </aside>

      {/* Secondary Modal: Model Risk / Preview Digest */}
      {inspectSuggestion && (
        <div
          onClick={() => setInspectSuggestion(null)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                {inspectSuggestion.secondaryActionLabel}
              </span>
              <button
                type="button"
                onClick={() => setInspectSuggestion(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <h3 className="text-sm font-bold text-slate-900">{inspectSuggestion.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {inspectSuggestion.secondaryActionLabel === 'Model Risk'
                ? 'Monte Carlo sensitivity check (1,000 runs) indicates <4% variance on SLA targets during rollout. Automatic rollback triggers if queue latency exceeds 12h.'
                : 'Preview Digest Format: Weekly async summary delivered Monday 08:30 AM EST covering Sprint Velocity, Blockers, and ERP PO Approvals across 4 functional leads.'}
            </p>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              {inspectSuggestion.advisorySource}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInspectSuggestion(null)}
                className="px-3 py-1.5 rounded border border-slate-200 text-xs font-medium text-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = inspectSuggestion;
                  setInspectSuggestion(null);
                  void handleExecute(target);
                }}
                className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold"
              >
                {inspectSuggestion.executed ? 'Pause Playbook' : 'Approve & Deploy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
