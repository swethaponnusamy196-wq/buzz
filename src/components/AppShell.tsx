import React, { useEffect, useState } from 'react';
import { ASSETS } from '../constants/assets.ts';
import type { NavRoute, WorkspaceState } from '../types.ts';

interface AppShellProps {
  activeRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  workspace: WorkspaceState;
  toastMessage: string | null;
  onDismissToast: () => void;
  children: React.ReactNode;
}

const ROUTE_LABELS: Record<NavRoute, string> = {
  dashboard: 'Overview',
  'ai-assistant': 'Executive Copilot',
  'smart-suggestions': 'Strategic Briefs',
  'data-analysis': 'Analytics & Metrics',
  reports: 'Reports & Digests',
  'user-management': 'User Management',
  settings: 'Preferences',
};

export const AppShell: React.FC<AppShellProps> = ({
  activeRoute,
  onNavigate,
  workspace,
  toastMessage,
  onDismissToast,
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (activeRoute !== 'user-management') {
          e.preventDefault();
          setSearchOpen((prev) => !prev);
        }
      } else if (e.key === 'Escape') {
        setDrawerOpen(false);
        setNotificationsOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeRoute]);

  const navigateAndClose = (route: NavRoute) => {
    setDrawerOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    onNavigate(route);
  };

  const navItems: Array<{ route: NavRoute; label: string; icon: string }> = [
    { route: 'dashboard', label: 'Overview', icon: 'space_dashboard' },
    { route: 'ai-assistant', label: 'Executive Assistant', icon: 'forum' },
    { route: 'smart-suggestions', label: 'Strategic Briefs', icon: 'lightbulb' },
    { route: 'data-analysis', label: 'Analytics & Metrics', icon: 'query_stats' },
    { route: 'reports', label: 'Reports & Digests', icon: 'description' },
  ];

  const adminItems: Array<{ route: NavRoute; label: string; icon: string }> = [
    { route: 'user-management', label: 'Team & Access', icon: 'group' },
    { route: 'settings', label: 'Preferences', icon: 'settings' },
  ];

  const searchableEntries = [
    ...navItems.map((item) => ({
      title: item.label,
      subtitle: 'Workspace View',
      route: item.route,
    })),
    ...adminItems.map((item) => ({
      title: item.label,
      subtitle: 'Administration',
      route: item.route,
    })),
    ...workspace.suggestions.map((s) => ({
      title: s.title,
      subtitle: `${s.badgeLabel} · ${s.department}`,
      route: 'smart-suggestions' as NavRoute,
    })),
    ...workspace.reports.map((r) => ({
      title: r.title,
      subtitle: `${r.category} · ${r.pages} pages`,
      route: 'reports' as NavRoute,
    })),
  ].filter(
    (entry) =>
      !searchQuery.trim() ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isStackHeader = activeRoute === 'user-management';
  const badgeText =
    activeRoute === 'smart-suggestions'
      ? 'Advisory'
      : activeRoute === 'dashboard'
        ? 'Exec'
        : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col lg:flex-row">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-30">
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80">
          <button
            type="button"
            onClick={() => navigateAndClose('dashboard')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white shrink-0">
              <span className="text-[12px] font-bold tracking-tighter">B</span>
            </div>
            <span className="text-[15px] font-semibold text-slate-900 tracking-tight whitespace-nowrap">
              Biz Assist
            </span>
            <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/70">
              Exec
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col justify-between">
          <div>
            <div className="py-2.5 px-3 bg-slate-50 border border-slate-200/80 rounded-lg mb-4 flex items-center gap-2.5">
              <img
                alt="Sarah Jenkins"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                src={ASSETS.sarahHeaderAvatar}
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] font-semibold text-slate-900 truncate">
                  {workspace.preferences.workspaceName}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {workspace.preferences.region}
                </span>
              </div>
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Workspace
            </div>
            <nav className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const active = activeRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => navigateAndClose(item.route)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors text-left ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        active ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="my-3 border-t border-slate-100" />

            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Settings
            </div>
            <nav className="flex flex-col gap-0.5">
              {adminItems.map((item) => {
                const active = activeRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => navigateAndClose(item.route)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors text-left ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        active ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigateAndClose('settings')}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-[12px] font-medium"
            >
              <span className="material-symbols-outlined text-[17px] text-slate-400">
                verified_user
              </span>
              <span className="truncate">Sarah Jenkins · COO</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 lg:left-64 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 pt-safe">
          <div className="h-14 px-4 flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-2.5">
              {isStackHeader ? (
                <button
                  type="button"
                  aria-label="Go Back"
                  onClick={() => navigateAndClose('dashboard')}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Open Navigation"
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[21px]">menu</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                {activeRoute === 'dashboard' ? (
                  <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white lg:hidden">
                    <span className="text-[12px] font-bold tracking-tighter">B</span>
                  </div>
                ) : (
                  <img
                    alt="Biz Assist Logo"
                    referrerPolicy="no-referrer"
                    className="h-6 w-auto object-contain lg:hidden"
                    src={ASSETS.brandLogo}
                  />
                )}
                {isStackHeader ? (
                  <div className="flex items-center gap-2">
                    <span className="hidden lg:inline text-[13px] font-medium text-slate-500">
                      Workspace
                    </span>
                    <span className="text-xs font-semibold text-slate-300">/</span>
                    <span className="font-headline font-semibold text-sm text-slate-900 tracking-tight">
                      User Management
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-[15px] font-semibold text-slate-900 tracking-tight lg:hidden">
                      Biz Assist
                    </span>
                    <span className="hidden lg:inline text-[14px] font-semibold text-slate-900 tracking-tight">
                      {ROUTE_LABELS[activeRoute]}
                    </span>
                    {badgeText && (
                      <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/70 ml-0.5">
                        {badgeText}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 relative">
              <button
                type="button"
                aria-label="Search workspace"
                onClick={() => {
                  setNotificationsOpen(false);
                  setSearchOpen(true);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">search</span>
              </button>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setSearchOpen(false);
                  setNotificationsOpen((p) => !p);
                }}
                className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>
              <button
                type="button"
                aria-label="Account profile"
                onClick={() => navigateAndClose('user-management')}
                className="ml-1 pl-1 border-l border-slate-200 flex items-center"
              >
                <img
                  alt="Sarah Jenkins"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  src={ASSETS.sarahHeaderAvatar}
                />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-11 w-80 bg-white rounded-xl border border-slate-200 shadow-lg p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-900">
                      Workspace Activity
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {workspace.briefingFeed.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateAndClose('reports')}
                        className="text-left p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-600 uppercase">
                            {item.category}
                          </span>
                          <span>{item.timestamp}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900 mt-0.5">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {item.summary}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Toast Feedback */}
        {toastMessage && (
          <div className="fixed top-16 left-4 right-4 lg:left-72 lg:right-8 max-w-xl mx-auto z-50 flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-900 text-white shadow-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">
                check_circle
              </span>
              <span className="text-xs font-medium text-slate-100">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={onDismissToast}
              className="p-1 text-slate-400 hover:text-white"
              aria-label="Dismiss notification"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        )}

        {/* Mobile Slide-Out Drawer Backdrop */}
        <div
          onClick={() => setDrawerOpen(false)}
          className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Mobile Slide-Out Navigation Drawer */}
        <aside
          className={`fixed top-0 bottom-0 left-0 w-[82%] max-w-[320px] z-50 bg-white border-r border-slate-200 shadow-xl flex flex-col justify-between transition-transform duration-300 ease-out pt-safe pb-safe lg:hidden ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col flex-1 overflow-y-auto px-4 py-4">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white">
                  <span className="text-[12px] font-bold">B</span>
                </div>
                <span className="text-[15px] font-semibold text-slate-900">Biz Assist</span>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-2.5 px-3 bg-slate-50 border border-slate-200/80 rounded-lg mb-4 flex items-center gap-2.5">
              <img
                alt="Sarah Jenkins"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                src={ASSETS.sarahHeaderAvatar}
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] font-semibold text-slate-900 truncate">
                  {workspace.preferences.workspaceName}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {workspace.preferences.region}
                </span>
              </div>
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Workspace
            </div>
            <nav className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const active = activeRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => navigateAndClose(item.route)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-left transition-colors ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        active ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="my-2 border-t border-slate-100" />
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                Settings
              </div>

              {adminItems.map((item) => {
                const active = activeRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => navigateAndClose(item.route)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-left transition-colors ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        active ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigateAndClose('settings')}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-colors text-[13px] font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              <span>Workspace Session</span>
            </button>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex flex-col relative w-full pt-14 pb-20 lg:pb-8 bg-[#f8fafc] min-h-screen">
          <div className="w-full max-w-5xl mx-auto">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        {activeRoute !== 'user-management' && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-white/95 backdrop-blur-md border-t border-slate-200/90 lg:hidden">
            <div className="flex items-center justify-around h-14 px-2">
              <button
                type="button"
                onClick={() => navigateAndClose('dashboard')}
                className={`flex flex-col items-center justify-center min-w-[54px] min-h-[40px] transition-colors ${
                  activeRoute === 'dashboard'
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                <span className="text-[10px] mt-0.5 tracking-tight">Overview</span>
              </button>
              <button
                type="button"
                onClick={() => navigateAndClose('ai-assistant')}
                className={`flex flex-col items-center justify-center min-w-[54px] min-h-[40px] transition-colors ${
                  activeRoute === 'ai-assistant'
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">forum</span>
                <span className="text-[10px] mt-0.5 tracking-tight">Assistant</span>
              </button>
              <button
                type="button"
                onClick={() => navigateAndClose('smart-suggestions')}
                className={`flex flex-col items-center justify-center min-w-[54px] min-h-[40px] transition-colors ${
                  activeRoute === 'smart-suggestions'
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeRoute === 'smart-suggestions' ? 'text-[#0051d5]' : ''
                  }`}
                >
                  lightbulb
                </span>
                <span className="text-[10px] mt-0.5 tracking-tight">Briefs</span>
              </button>
              <button
                type="button"
                onClick={() => navigateAndClose('reports')}
                className={`flex flex-col items-center justify-center min-w-[54px] min-h-[40px] transition-colors ${
                  activeRoute === 'reports'
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">description</span>
                <span className="text-[10px] mt-0.5 tracking-tight">Reports</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex flex-col items-center justify-center min-w-[54px] min-h-[40px] text-slate-400 hover:text-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
                <span className="text-[10px] mt-0.5 tracking-tight">More</span>
              </button>
            </div>
          </nav>
        )}
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div
          onClick={() => setSearchOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-100">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                search
              </span>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to view, directive, or report..."
                className="flex-1 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent border-none outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-[11px] font-mono text-slate-400 px-1.5 py-0.5 rounded border border-slate-200"
              >
                ESC
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 flex flex-col gap-1">
              {searchableEntries.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No matching workspace items found.
                </div>
              ) : (
                searchableEntries.map((item, idx) => (
                  <button
                    key={`${item.title}-${idx}`}
                    type="button"
                    onClick={() => navigateAndClose(item.route)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      arrow_forward
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
