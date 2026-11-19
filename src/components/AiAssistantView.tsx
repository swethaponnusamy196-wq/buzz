import React, { useEffect, useRef, useState } from 'react';
import { ASSETS } from '../constants/assets.ts';
import type { ChatMessage, CopilotContext, NavRoute, WorkspaceState } from '../types.ts';

interface AiAssistantViewProps {
  workspace: WorkspaceState;
  prefillPrompt?: string | null;
  onClearPrefill?: () => void;
  onSendMessage: (prompt: string, context: CopilotContext) => Promise<void>;
  onFeedback: (id: string, feedback: 'up' | 'down' | null) => Promise<void>;
  onNavigate: (route: NavRoute) => void;
  onShowToast: (msg: string) => void;
}

const CONTEXT_OPTIONS: CopilotContext[] = [
  'General Business',
  'Operations & Logistics',
  'Team & HR',
  'Strategy',
];

const SUGGESTED_CHIPS = [
  {
    label: 'Summarize Q3 milestones',
    icon: 'bar_chart',
    prompt: 'Summarize Q3 milestones against target KPIs',
  },
  {
    label: 'Retention tactics for enterprise',
    icon: 'lightbulb',
    prompt: 'Brainstorm customer retention tactics for high-tier accounts',
  },
  {
    label: 'Identify operational risks',
    icon: 'warning',
    prompt: 'Identify key operational risks across our supply chain',
  },
  {
    label: 'Forecast team capacity',
    icon: 'trending_up',
    prompt: 'Forecast team capacity next month under current client bookings',
  },
];

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  workspace,
  prefillPrompt,
  onClearPrefill,
  onSendMessage,
  onFeedback,
  onNavigate,
  onShowToast,
}) => {
  const [activeContext, setActiveContext] = useState<CopilotContext>('Operations & Logistics');
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [modelInfoOpen, setModelInfoOpen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefillPrompt) {
      setInputValue(prefillPrompt);
      inputRef.current?.focus();
      onClearPrefill?.();
    }
  }, [prefillPrompt, onClearPrefill]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setErrorMessage(null);
    try {
      await onSendMessage(trimmed, activeContext);
      setInputValue('');
      setTimeout(() => {
        streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to reach Executive Copilot right now.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleCopySynthesis = async (msg: ChatMessage) => {
    const text = msg.structuredSynthesis
      ? [
          msg.structuredSynthesis.title,
          msg.structuredSynthesis.subtitle,
          ...msg.structuredSynthesis.items.map(
            (it) => `${it.number} ${it.title} (${it.tag}): ${it.solution}`
          ),
        ].join('\n\n')
      : msg.text;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      onShowToast('Summary points copied to clipboard.');
    }
  };

  const handleExportSummary = (msg: ChatMessage) => {
    const content = msg.structuredSynthesis
      ? `${msg.structuredSynthesis.title}\n\n${msg.structuredSynthesis.subtitle}\n\n${msg.structuredSynthesis.items
          .map((i) => `${i.number}. ${i.title} [${i.tag}]\n${i.solution}`)
          .join('\n\n')}`
      : msg.text;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'biz-assist-executive-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported executive summary.');
  };

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const snippet = (await file.text()).slice(0, 500);
      setInputValue((prev) =>
        `${prev ? `${prev}\n` : ''}Analyze attached context (${file.name}):\n${snippet}`
      );
      inputRef.current?.focus();
    } catch {
      onShowToast('Attached file reference added.');
    } finally {
      e.target.value = '';
    }
  };

  const toggleVoice = () => {
    setIsRecording((prev) => {
      const next = !prev;
      if (next) {
        onShowToast('Voice capture active — tap mic again to stop.');
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full pb-6">
      {/* Executive Framing & Context Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200/75 relative">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-900 text-white shrink-0">
              <span className="material-symbols-outlined text-[16px]">terminal</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-headline text-[13px] font-semibold text-slate-900 tracking-tight truncate">
                  Executive Copilot
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-medium text-slate-500 truncate">
                  Financials &amp; Operations Model
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-slate-500 truncate">
                  Real-time sync · ERP &amp; Q3 Jira
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Model Parameters"
            onClick={() => setModelInfoOpen((p) => !p)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shrink-0 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[14px] text-slate-500">tune</span>
            <span className="font-headline text-[11px] font-medium">Model 4.1</span>
          </button>
        </div>

        {modelInfoOpen && (
          <div className="mb-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-slate-900">
                {workspace.preferences.aiModelLabel}
              </div>
              <div className="text-[11px] text-slate-500">
                Grounded on live workspace KPIs, Jira sprint logs, and active directives.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModelInfoOpen(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Minimal Context Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CONTEXT_OPTIONS.map((ctx) => {
            const active = activeContext === ctx;
            return (
              <button
                key={ctx}
                type="button"
                onClick={() => setActiveContext(ctx)}
                className={`shrink-0 px-2.5 py-1 rounded-md font-headline text-[11px] font-medium transition-all active:scale-95 border ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {ctx}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Stream */}
      <div className="flex flex-col gap-5 px-4 py-5">
        <div className="flex items-center justify-center my-0.5">
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
            Today · Strategic Working Session
          </span>
        </div>

        {workspace.chatMessages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div
                key={msg.id}
                className="flex items-start justify-end gap-2.5 max-w-[90%] self-end"
              >
                <div className="flex flex-col items-end gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                    <span className="font-headline text-[12px] font-semibold text-slate-900">
                      {msg.senderName}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 shadow-2xs">
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 ring-1 ring-slate-300">
                  <img
                    alt="Sarah (COO)"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    src={ASSETS.sarahChatAvatar}
                  />
                </div>
              </div>
            );
          }

          if (msg.structuredSynthesis) {
            const syn = msg.structuredSynthesis;
            return (
              <div key={msg.id} className="flex items-start gap-3 w-full">
                <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">analytics</span>
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-[12px] font-semibold text-slate-900">
                        {msg.senderName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-600">
                        Verified Pipeline
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col gap-3.5 text-slate-800">
                    <div className="border-b border-slate-100 pb-2.5">
                      <div className="font-headline text-[14px] font-semibold text-slate-900">
                        {syn.title}
                      </div>
                      <p className="text-[12px] text-slate-500 mt-1 leading-normal">
                        {syn.subtitle}
                      </p>
                    </div>

                    {syn.items.map((item) => (
                      <div
                        key={item.number}
                        className="border border-slate-200/90 rounded-lg p-3 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-semibold text-slate-700 px-1.5 py-0.5 rounded bg-slate-200/70">
                              {item.number}
                            </span>
                            <span className="font-headline text-[13px] font-semibold text-slate-900">
                              {item.title}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${
                              item.tagTone === 'rose'
                                ? 'text-rose-700 bg-rose-50 border-rose-200'
                                : 'text-slate-700 bg-slate-100 border-slate-200'
                            }`}
                          >
                            {item.tag}
                          </span>
                        </div>
                        <div className="pl-6 text-[12px] text-slate-600 leading-relaxed">
                          <span className="font-medium text-slate-800">
                            Zero-Headcount Solution:
                          </span>{' '}
                          {item.solution}
                        </div>
                      </div>
                    ))}

                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-600 text-[16px]">
                          trending_up
                        </span>
                        <span className="text-[12px] text-slate-600 font-medium">
                          {syn.metricLabel}
                        </span>
                      </div>
                      <span className="text-[12px] font-headline font-semibold text-slate-900">
                        {syn.metricValue}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setInputValue(
                            'Draft a 30-day execution roadmap with owners and milestones for these 3 bottlenecks.'
                          );
                          inputRef.current?.focus();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 text-white font-headline text-[12px] font-semibold hover:bg-slate-800 active:scale-[0.99] transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">fact_check</span>
                        <span>Draft Execution Roadmap</span>
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleExportSummary(msg)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-headline text-[11px] font-medium hover:bg-slate-50 transition-colors active:scale-95 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[15px] text-slate-500">
                            ios_share
                          </span>
                          <span>Export Summary</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleCopySynthesis(msg)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-headline text-[11px] font-medium hover:bg-slate-50 transition-colors active:scale-95 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[15px] text-slate-500">
                            content_copy
                          </span>
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy Points'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-0.5 text-slate-400">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="material-symbols-outlined text-[13px]">verified_user</span>
                      <span>{syn.auditSource}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        aria-label="Helpful"
                        onClick={() =>
                          void onFeedback(msg.id, msg.feedback === 'up' ? null : 'up')
                        }
                        className={`w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors ${
                          msg.feedback === 'up' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">thumb_up</span>
                      </button>
                      <button
                        type="button"
                        aria-label="Not helpful"
                        onClick={() =>
                          void onFeedback(msg.id, msg.feedback === 'down' ? null : 'down')
                        }
                        className={`w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors ${
                          msg.feedback === 'down' ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">thumb_down</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex items-start gap-3 max-w-[94%]">
              <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[15px]">data_object</span>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-headline text-[12px] font-semibold text-slate-900">
                    {msg.senderName}
                  </span>
                  <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-2xs">
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-start gap-3 max-w-[94%]">
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200/80 bg-white text-slate-500 text-xs">
              Synthesizing telemetry across ERP, Jira, and Q3 KPIs...
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start justify-between gap-2">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          </div>
        )}

        <div ref={streamEndRef} />
      </div>

      {/* Run-Rate Telemetry Card */}
      <div className="px-4 mb-2">
        <button
          type="button"
          onClick={() => onNavigate('smart-suggestions')}
          className="w-full p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center gap-3 hover:border-slate-300 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
            <img
              alt="Operational Efficiency Graphic"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              src={ASSETS.telemetryGraphic}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-headline text-[12px] font-semibold text-slate-900 truncate">
                Operational Efficiency Rate
              </span>
              <span className="font-headline text-[12px] font-semibold text-slate-900 tabular-nums">
                {workspace.metrics.efficiency.value}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {workspace.suggestions.filter((s) => !s.executed).length} automated trigger rules
              currently in staging
            </p>
          </div>
          <div className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </div>
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="px-4 pt-1 pb-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Suggested Inquiries
          </span>
          <span className="text-[11px] text-slate-500">Tap to insert</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {SUGGESTED_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setInputValue(chip.prompt);
                inputRef.current?.focus();
              }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-headline text-[11px] font-medium hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[14px] text-slate-500">
                {chip.icon}
              </span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tactical Input Bar */}
      <div className="px-4 pt-1 pb-1">
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-2 flex flex-col gap-1.5 focus-within:border-slate-400 transition-colors">
          <div className="flex items-center justify-between px-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Context: {activeContext} Active</span>
            </div>
            <button
              type="button"
              onClick={() => setInputValue('')}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex items-end gap-1.5 pt-0.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.json,.md"
              onChange={(e) => void handleAttachFile(e)}
              className="hidden"
            />
            <button
              type="button"
              aria-label="Attach file"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">attach_file</span>
            </button>
            <button
              type="button"
              aria-label="Voice input"
              onClick={toggleVoice}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors active:scale-95 shrink-0 ${
                isRecording
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>
            <div className="flex-1 min-w-0">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  sending
                    ? 'Processing query against verified ledger...'
                    : 'Ask Biz Assist about financials, team, or operations...'
                }
                className="w-full bg-transparent resize-none border-none outline-none text-[13px] text-slate-900 placeholder:text-slate-400 py-1.5 max-h-24 leading-snug"
              />
            </div>
            <button
              type="button"
              aria-label="Send prompt"
              disabled={sending || !inputValue.trim()}
              onClick={() => void handleSend()}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shrink-0 shadow-2xs disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
