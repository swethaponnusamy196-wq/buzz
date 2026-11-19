import React, { useState } from 'react';
import { ASSETS } from '../constants/assets.ts';
import type { BriefingFeedItem, ChartPeriod, NavRoute, WorkspaceState } from '../types.ts';

interface DashboardViewProps {
  workspace: WorkspaceState;
  onNavigate: (route: NavRoute) => void;
  onExecuteDirective: () => Promise<void>;
  onImportDataset: (payload: {
    filename: string;
    recordCount: number;
    efficiencyDelta: number;
  }) => Promise<void>;
  onGenerateReport: (topic?: string, category?: string) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workspace,
  onNavigate,
  onExecuteDirective,
  onImportDataset,
  onGenerateReport,
  onShowToast,
}) => {
  const [period, setPeriod] = useState<ChartPeriod>('week');
  const [executingDirective, setExecutingDirective] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [datasetFilename, setDatasetFilename] = useState('q3_regional_sla_telemetry.csv');
  const [datasetRecords, setDatasetRecords] = useState('28');
  const [datasetDelta, setDatasetDelta] = useState('0.4');
  const [importing, setImporting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [specsModalOpen, setSpecsModalOpen] = useState(false);
  const [outlookOpen, setOutlookOpen] = useState(false);
  const [activeBriefing, setActiveBriefing] = useState<BriefingFeedItem | null>(null);

  const { metrics, healthIndex, briefingFeed } = workspace;
  const activeChart = healthIndex[period];

  const handleDirectiveClick = async () => {
    setExecutingDirective(true);
    try {
      await onExecuteDirective();
      onShowToast(
        metrics.directiveCallout.executed
          ? 'Onboarding cadence workflow paused.'
          : 'Automated onboarding cadence workflow executed.'
      );
    } finally {
      setExecutingDirective(false);
    }
  };

  const handleDatasetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    try {
      await onImportDataset({
        filename: datasetFilename.trim() || 'operational_dataset.csv',
        recordCount: Number(datasetRecords) || 24,
        efficiencyDelta: Number(datasetDelta) || 0,
      });
      setImportModalOpen(false);
      onShowToast(`Imported ${datasetFilename || 'dataset'} into live telemetry.`);
    } finally {
      setImporting(false);
    }
  };

  const handleQuickReport = async () => {
    setGeneratingReport(true);
    try {
      await onGenerateReport('Executive Operational Pulse Brief', 'Operations');
      onShowToast('New executive digest generated in Reports.');
      onNavigate('reports');
    } finally {
      setGeneratingReport(false);
    }
  };

  const barColorClass = (highlight?: string) => {
    switch (highlight) {
      case 'peak':
        return 'bg-blue-600';
      case 'mid':
        return 'bg-blue-400';
      case 'soft':
        return 'bg-blue-300';
      default:
        return 'bg-slate-200';
    }
  };

  return (
    <div className="flex flex-col w-full px-4 pt-4 pb-6 space-y-4">
      {/* Editorial Header & Status Bar */}
      <section className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Executive Overview • Q3 Week 8
          </span>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/70 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium">{metrics.syncedLabel}</span>
          </div>
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight leading-snug">
            Welcome back, Sarah
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">
            Here is your operational pulse across 4 regions for today, Aug 24.
          </p>
        </div>
      </section>

      {/* Restrained Command Bar */}
      <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        <button
          type="button"
          onClick={() => onNavigate('ai-assistant')}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[12px] font-medium shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[15px]">chat_bubble_outline</span>
          <span>Ask Assistant</span>
        </button>
        <button
          type="button"
          onClick={() => setImportModalOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 active:scale-95 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <span className="material-symbols-outlined text-[15px] text-slate-500">upload</span>
          <span>Import Dataset</span>
        </button>
        <button
          type="button"
          disabled={generatingReport}
          onClick={handleQuickReport}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 active:scale-95 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[15px] text-slate-500">summarize</span>
          <span>{generatingReport ? 'Generating...' : 'Generate Report'}</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('smart-suggestions')}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 active:scale-95 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <span className="material-symbols-outlined text-[15px] text-slate-500">tune</span>
          <span>Audit Rules</span>
        </button>
      </section>

      {/* 2x2 (4-col on desktop) Clean Structured Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Operational Efficiency */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Efficiency
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 tabular-nums">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              {metrics.efficiency.delta}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[23px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
              {metrics.efficiency.value}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>{metrics.efficiency.target}</span>
              <span className="text-slate-400">{metrics.efficiency.status}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Customer Sentiment */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Sentiment
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 tabular-nums">
              <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
              {metrics.sentiment.delta}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[23px] font-bold text-slate-900 tracking-tight leading-none flex items-baseline gap-1 tabular-nums">
              {metrics.sentiment.value}{' '}
              <span className="text-[13px] font-normal text-slate-400">
                {metrics.sentiment.scale}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>{metrics.sentiment.reviews}</span>
              <span className="text-slate-400">{metrics.sentiment.percentile}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Velocity Sparkline */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tasks
            </span>
            <span className="text-[11px] font-medium text-slate-500">{metrics.tasks.period}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-[23px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
              {metrics.tasks.value}
            </div>
            <div className="w-14 h-5">
              <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 58 18">
                <path
                  d="M2 14 L11 12 L20 15 L29 8 L38 10 L47 4 L56 5"
                  stroke="#2563eb"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                />
                <circle cx="56" cy="5" fill="#2563eb" r="2" />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{metrics.tasks.velocity}</span>
            <span className="text-slate-400">{metrics.tasks.pending} pending</span>
          </div>
        </div>

        {/* Card 4: Actionable Recommendations */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Directives
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
              {metrics.directives.status}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[23px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
              {metrics.directives.value}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>{metrics.directives.highPriority} high priority</span>
              <button
                type="button"
                onClick={() => onNavigate('smart-suggestions')}
                className="text-blue-600 font-medium hover:underline cursor-pointer"
              >
                Review
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Recommendation Callout */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Operational Directive
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {metrics.directiveCallout.roiLabel}
          </span>
        </div>
        <div className="space-y-1">
          <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">
            {metrics.directiveCallout.title}
          </h2>
          <p className="text-[12px] text-slate-600 leading-relaxed">
            {metrics.directiveCallout.description}{' '}
            <strong className="text-slate-900 font-semibold">
              {metrics.directiveCallout.savedHours}
            </strong>{' '}
            per account manager.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            disabled={executingDirective}
            onClick={handleDirectiveClick}
            className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-white text-[12px] font-medium active:scale-95 transition-all ${
              metrics.directiveCallout.executed
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {metrics.directiveCallout.executed ? 'check' : 'play_circle'}
            </span>
            <span>{metrics.directiveCallout.executed ? 'Executed' : 'Apply Workflow'}</span>
          </button>
          <button
            type="button"
            onClick={() => setSpecsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-medium transition-colors"
          >
            <span>Review specs</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">
              arrow_forward
            </span>
          </button>
        </div>
      </section>

      {/* Responsive Split on Desktop: Chart + Quarterly Outlook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Weekly Performance Chart */}
        <section className="lg:col-span-7 rounded-xl bg-white border border-slate-200 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col gap-3 justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-[14px] font-semibold text-slate-900">Weekly Health Index</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Composite score across output and delivery SLAs
              </p>
            </div>
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80">
              {(['day', 'week', 'month'] as ChartPeriod[]).map((p) => {
                const label = p === 'day' ? 'D' : p === 'week' ? 'W' : 'M';
                const active = period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                      active
                        ? 'font-semibold text-slate-900 bg-white shadow-xs'
                        : 'font-medium text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-md border border-slate-100">
            <span className="font-medium text-slate-900">{activeChart.peakLabel}</span>
            <span className="text-blue-600 font-medium">{activeChart.deltaLabel}</span>
          </div>

          <div className="flex items-end justify-between h-36 pt-4 pb-1 px-1">
            {activeChart.bars.map((bar, idx) => (
              <div key={`${period}-${bar.label}-${idx}`} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className={`w-3 rounded-t-sm transition-all duration-300 ${barColorClass(
                      bar.highlight
                    )}`}
                    style={{ height: `${bar.value}%` }}
                    title={`${bar.label}: ${bar.value}%`}
                  />
                </div>
                <span
                  className={`text-[10px] ${
                    bar.highlight === 'peak'
                      ? 'font-bold text-slate-900'
                      : bar.value < 45
                        ? 'font-medium text-slate-300'
                        : 'font-medium text-slate-400'
                  }`}
                >
                  {bar.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-blue-600" />
              <span>Actual throughput</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-slate-200" />
              <span>Baseline average</span>
            </div>
          </div>
        </section>

        {/* Executive Strategy Card with Clean Image Header */}
        <section className="lg:col-span-5 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="h-28 lg:flex-1 lg:min-h-[180px] w-full relative overflow-hidden bg-slate-900">
            <img
              alt="Executive Quarterly Outlook"
              referrerPolicy="no-referrer"
              src={ASSETS.quarterlyOutlookBanner}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]" />
            <div className="absolute inset-0 p-3.5 flex flex-col justify-between text-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 backdrop-blur-md">
                  Briefing Document
                </span>
                <span className="text-[11px] text-slate-200 font-mono">PDF • 14 pages</span>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white tracking-tight">
                  Executive Quarterly Outlook
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5">
                  Macro scenarios and headcount allocation models
                </p>
              </div>
            </div>
          </div>
          <div className="px-3.5 py-2.5 bg-white flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500">Prepared by Strategy Office</span>
            <button
              type="button"
              onClick={() => setOutlookOpen(true)}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-900 hover:text-blue-600 transition-colors"
            >
              <span>Open brief</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </section>
      </div>

      {/* Executive Summaries Feed */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Briefing Feed
            </span>
            <span className="text-[11px] text-slate-400">• Today</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="text-[12px] font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-0.5"
          >
            View archive
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {briefingFeed.map((item) => (
            <article
              key={item.id}
              className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300 transition-colors space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60 uppercase tracking-wide">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <button
                    type="button"
                    aria-label="Open digest options"
                    onClick={() => setActiveBriefing(item)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                  </button>
                </div>
                <h3 className="text-[13px] font-semibold text-slate-900">{item.title}</h3>
                <p className="text-[12px] text-slate-600 leading-relaxed">{item.summary}</p>
              </div>
              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium inline-flex items-center gap-1">
                  {item.hasGreenDot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                  {item.footerLeft}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveBriefing(item)}
                  className="text-blue-600 font-medium hover:underline flex items-center"
                >
                  Details
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom Executive Quick Query Bar */}
      <div className="pt-1">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
              <span className="material-symbols-outlined text-[16px]">terminal</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-white">Ask Biz Assist</span>
              <span className="text-[10px] text-slate-400">Query reports, telemetry &amp; logs</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('ai-assistant')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-900 text-[11px] font-semibold shadow-xs hover:bg-slate-100 active:scale-95 transition-all"
          >
            <span>Query</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Import Dataset Modal */}
      {importModalOpen && (
        <div
          onClick={() => setImportModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <form
            onSubmit={handleDatasetSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-xl sm:rounded-xl p-5 flex flex-col gap-4 shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Import Operational Dataset</h3>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dataset Filename
                </label>
                <input
                  value={datasetFilename}
                  onChange={(e) => setDatasetFilename(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-slate-300 text-xs text-slate-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Task Records
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={datasetRecords}
                    onChange={(e) => setDatasetRecords(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Efficiency Shift (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="-5"
                    max="5"
                    value={datasetDelta}
                    onChange={(e) => setDatasetDelta(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="flex-1 py-2 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={importing}
                className="flex-1 py-2 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60"
              >
                {importing ? 'Ingesting...' : 'Ingest Records'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workflow Specs Modal */}
      {specsModalOpen && (
        <div
          onClick={() => setSpecsModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-xl p-5 border border-slate-200 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Directive Specification
              </span>
              <button
                type="button"
                onClick={() => setSpecsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {metrics.directiveCallout.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automates welcome dispatch, KYC document schema checks, and Day-3 / Day-7 stakeholder
              readiness reminders across Tier 1 &amp; Tier 2 accounts.
            </p>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Projected Capacity Recovery</span>
                <span className="font-semibold text-slate-900">4.5 hrs / wk / AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ROI Forecast</span>
                <span className="font-semibold text-emerald-700">+18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Risk Profile</span>
                <span className="font-semibold text-slate-900">Low · Human override active</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSpecsModalOpen(false);
                  if (!metrics.directiveCallout.executed) {
                    void handleDirectiveClick();
                  }
                }}
                className="flex-1 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                {metrics.directiveCallout.executed ? 'Workflow Active' : 'Apply Workflow'}
              </button>
              <button
                type="button"
                onClick={() => setSpecsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Quarterly Outlook Modal */}
      {outlookOpen && (
        <div
          onClick={() => setOutlookOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Strategy Office • 14 Pages
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Executive Quarterly Outlook
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOutlookOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Regional fulfillment SLA compliance across all 4 territories has reached{' '}
                <strong className="text-slate-900">{metrics.efficiency.value}</strong>, outpacing
                our 90% Q3 threshold by 4.2 percentage points.
              </p>
              <ul className="space-y-1.5 list-disc pl-4">
                <li>Zero incremental headcount required for Q3-Q4 onboarding surge.</li>
                <li>Midwest depot carrier rebalancing removed 22 hours of staging delay.</li>
                <li>Recommended reallocation: shift 0.3 FTE capacity to Tier 1 retention.</li>
              </ul>
            </div>
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOutlookOpen(false);
                  onNavigate('reports');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
              >
                Open in Reports Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Briefing Feed Details Modal */}
      {activeBriefing && (
        <div
          onClick={() => setActiveBriefing(null)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                {activeBriefing.category} · {activeBriefing.timestamp}
              </span>
              <button
                type="button"
                onClick={() => setActiveBriefing(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900">{activeBriefing.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{activeBriefing.fullReport}</p>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
              <span className="font-medium text-slate-500">{activeBriefing.footerLeft}</span>
              <button
                type="button"
                onClick={() => setActiveBriefing(null)}
                className="px-3 py-1.5 rounded bg-slate-900 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
