import React, { useEffect, useRef, useState } from 'react';
import type { MemberRole, SecuritySettings, TeamMember, WorkspaceState } from '../types.ts';

interface UserManagementViewProps {
  workspace: WorkspaceState;
  onInviteMember: (email: string, role: MemberRole) => Promise<void>;
  onUpdateRole: (memberId: string, role: MemberRole) => Promise<void>;
  onResendInvite: (memberId: string) => Promise<void>;
  onUpdateSecurity: (patch: Partial<SecuritySettings>) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  workspace,
  onInviteMember,
  onUpdateRole,
  onResendInvite,
  onUpdateSecurity,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | MemberRole>('all');
  const [roleMatrixOpen, setRoleMatrixOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('Manager');
  const [inviting, setInviting] = useState(false);
  const [inspectModal, setInspectModal] = useState<{
    member: TeamMember;
    mode: 'permissions' | 'activity';
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const extraInvites = Math.max(0, workspace.members.length - 5);
  const usedSeats = 18 + extraInvites;
  const totalSeats = workspace.totalSeats;
  const availableSeats = Math.max(0, totalSeats - usedSeats);

  const adminCount =
    4 + workspace.members.filter((m) => m.role === 'Admin').length - 1;
  const managerCount =
    8 + workspace.members.filter((m) => m.role === 'Manager').length - 2;
  const analystCount =
    6 + workspace.members.filter((m) => m.role === 'Analyst').length - 1;
  const pendingCount = workspace.members.filter((m) => m.role === 'Pending').length;

  const filteredMembers = workspace.members.filter((m) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inviteEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      onShowToast('Please enter a valid corporate email.');
      return;
    }
    setInviting(true);
    try {
      await onInviteMember(trimmed, inviteRole);
      setInviteModalOpen(false);
      setInviteEmail('');
      onShowToast(`Invitation sent to ${trimmed} as ${inviteRole}!`);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Unable to send invitation.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-safe max-w-2xl lg:max-w-4xl mx-auto">
      {/* Header & Primary Action */}
      <div className="px-4 pt-5 pb-3 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-headline text-xl font-bold text-slate-900 tracking-tight">
              Team &amp; Access
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage workspace identities, roles, and seat allocations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#070235] text-white hover:bg-[#14007a] transition-all text-xs font-medium tracking-tight shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Invite Team Member</span>
          </button>
        </div>

        {/* Seat Allocation Card */}
        <div className="rounded-lg bg-white border border-slate-200/90 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                Seat Utilization
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-headline text-base font-bold text-slate-900 tabular-nums">
                  {usedSeats}
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  of {totalSeats} seats used
                </span>
              </div>
            </div>
            <div className="px-2 py-1 rounded bg-slate-100 text-[11px] font-semibold text-slate-700 tracking-tight tabular-nums">
              {availableSeats} available
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-sm h-2 overflow-hidden flex gap-0.5 p-0.5">
            <div
              className="bg-[#070235] h-full rounded-xs transition-all duration-300"
              style={{ width: `${(adminCount / totalSeats) * 100}%` }}
              title={`Admins: ${adminCount}`}
            />
            <div
              className="bg-[#0051d5] h-full rounded-xs transition-all duration-300"
              style={{ width: `${(managerCount / totalSeats) * 100}%` }}
              title={`Managers: ${managerCount}`}
            />
            <div
              className="bg-indigo-400 h-full rounded-xs transition-all duration-300"
              style={{ width: `${(analystCount / totalSeats) * 100}%` }}
              title={`Analysts: ${analystCount}`}
            />
            <div className="bg-slate-200 h-full rounded-xs flex-1" title={`Unassigned: ${availableSeats}`} />
          </div>

          <div className="flex items-center justify-between pt-2.5 text-[11px] text-slate-600 border-t border-slate-100 mt-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#070235]" />
              <span>{adminCount} Admins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#0051d5]" />
              <span>{managerCount} Managers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-indigo-400" />
              <span>{analystCount} Analysts</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-xs bg-slate-200" />
              <span>{availableSeats} Vacant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-4 py-2 flex flex-col gap-2.5">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-10 pl-9 pr-16 rounded-md bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 shadow-sm transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1 mr-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-400 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {[
            { key: 'all' as const, label: `All (${usedSeats})` },
            { key: 'Admin' as const, label: `Admin (${adminCount})` },
            { key: 'Manager' as const, label: `Manager (${managerCount})` },
            { key: 'Analyst' as const, label: `Analyst (${analystCount})` },
            { key: 'Pending' as const, label: `Pending (${pendingCount})` },
          ].map((pill) => {
            const active = roleFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setRoleFilter(pill.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Member Roster List */}
      <div className="px-4 py-2 flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Workspace Roster
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {filteredMembers.length} Member{filteredMembers.length === 1 ? '' : 's'} shown
          </span>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="rounded-lg bg-white border border-slate-200 p-8 text-center flex flex-col items-center justify-center gap-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search_off</span>
            </div>
            <div className="font-headline text-xs font-semibold text-slate-900">
              No members match your search
            </div>
            <p className="text-xs text-slate-500 max-w-xs">
              Check for spelling errors or clear filters to view the complete roster.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
              }}
              className="mt-2 px-3 py-1 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset Search
            </button>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const isPending = member.role === 'Pending';
            return (
              <div
                key={member.id}
                className="rounded-lg bg-white border border-slate-200/90 p-3.5 shadow-sm flex flex-col gap-3 transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      {member.avatarUrl ? (
                        <img
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                          src={member.avatarUrl}
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-headline text-xs ${
                            isPending
                              ? 'bg-slate-50 text-slate-400 border border-dashed border-slate-300 font-semibold'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 font-bold'
                          }`}
                        >
                          {member.initials}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                          isPending ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        title={isPending ? 'Pending Invite' : 'Active'}
                      />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline text-xs font-semibold text-slate-900 truncate">
                          {member.name}
                        </span>
                        {member.isOwner && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 truncate">{member.email}</span>
                    </div>
                  </div>

                  {member.isOwner ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                      Admin
                    </span>
                  ) : isPending ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 flex-shrink-0">
                      Pending
                    </span>
                  ) : (
                    <div className="relative flex-shrink-0">
                      <select
                        aria-label={`Role for ${member.name}`}
                        value={member.role}
                        onChange={(e) => {
                          const nextRole = e.target.value as MemberRole;
                          void onUpdateRole(member.id, nextRole).then(() =>
                            onShowToast(`Role updated to ${nextRole} for ${member.name}`)
                          );
                        }}
                        className="appearance-none pl-2.5 pr-6 py-1 rounded bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-slate-400 transition-colors"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Analyst">Analyst</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[14px]">
                        unfold_more
                      </span>
                    </div>
                  )}
                </div>

                {member.isOwner ? (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span className="font-medium text-slate-700">Workspace Owner</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400">Full Permissions</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Primary Account</span>
                  </div>
                ) : isPending ? (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>{member.invitedAgo || 'Invited recently'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void onResendInvite(member.id).then(() =>
                          onShowToast(`Invitation re-sent to ${member.email}`)
                        )
                      }
                      className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                    >
                      <span className="material-symbols-outlined text-[13px]">send</span>
                      <span>Resend Invite</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>{member.title}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setInspectModal({ member, mode: 'permissions' })}
                        className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                      >
                        Permissions
                      </button>
                      <span className="text-slate-200">|</span>
                      <button
                        type="button"
                        onClick={() => setInspectModal({ member, mode: 'activity' })}
                        className="text-[#0051d5] hover:underline font-medium flex items-center gap-0.5"
                      >
                        <span>View Activity</span>
                        <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Collapsible Role Permissions Matrix */}
      <div className="px-4 py-2">
        <div className="rounded-lg bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setRoleMatrixOpen((p) => !p)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              </span>
              <div>
                <div className="font-headline text-xs font-semibold text-slate-900">
                  Role Permissions Matrix
                </div>
                <div className="text-[11px] text-slate-500">
                  Workspace authority &amp; execution rights
                </div>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${
                roleMatrixOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {roleMatrixOpen && (
            <div className="px-4 pb-3.5 flex flex-col gap-2 border-t border-slate-100">
              <div className="grid grid-cols-1 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">
                    A
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs">Admin</span>
                      <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                        Full Control
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Full governance: billing, seat assignment, enterprise integrations, and data
                      deletion policies.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-[#0051d5] text-white flex items-center justify-center text-[10px] font-bold mt-0.5">
                    M
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs">Manager</span>
                      <span className="text-[10px] font-medium text-[#0051d5] uppercase tracking-wider">
                        Create &amp; Edit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Configure department workflows, initiate AI triggers, and publish shared
                      dashboard templates.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">
                    L
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs">Analyst</span>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        Read &amp; Run
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Run analytical queries, monitor real-time metrics, and view shared workspace
                      reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security & Governance */}
      <div className="px-4 pt-2 pb-8 flex flex-col gap-2.5">
        <div className="px-0.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Security &amp; Governance
          </span>
        </div>

        <div className="rounded-lg bg-white border border-slate-200/90 shadow-sm divide-y divide-slate-100">
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 pr-2">
              <span className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">
                  enhanced_encryption
                </span>
              </span>
              <div>
                <div className="font-headline text-xs font-semibold text-slate-900">
                  Enforce Two-Factor Authentication
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Require 2FA authentication for all {usedSeats} active team members across mobile
                  and web.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={workspace.securitySettings.enforceTwoFactor}
                onChange={(e) => {
                  const checked = e.target.checked;
                  void onUpdateSecurity({ enforceTwoFactor: checked }).then(() =>
                    onShowToast(
                      `Two-Factor Authentication policy is now ${checked ? 'enforced' : 'disabled'}.`
                    )
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:bg-slate-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm peer-checked:after:translate-x-4" />
            </label>
          </div>

          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 pr-2">
              <span className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">domain</span>
              </span>
              <div>
                <div className="font-headline text-xs font-semibold text-slate-900">
                  Horizon Domain Auto-join
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Allow users with verified <span className="font-medium text-slate-700">@horizon.com</span>{' '}
                  emails to automatically enter as Analyst.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={workspace.securitySettings.domainAutoJoin}
                onChange={(e) => {
                  const checked = e.target.checked;
                  void onUpdateSecurity({ domainAutoJoin: checked }).then(() =>
                    onShowToast(
                      `Domain auto-join policy is now ${checked ? 'enabled' : 'disabled'}.`
                    )
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:bg-slate-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm peer-checked:after:translate-x-4" />
            </label>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div
          onClick={() => setInviteModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <form
            onSubmit={handleInviteSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-xl sm:rounded-lg p-5 flex flex-col gap-4 shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-700">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                </span>
                <h3 className="font-headline text-sm font-bold text-slate-900">
                  Invite Team Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email
                </label>
                <input
                  autoFocus
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@horizon.com"
                  className="w-full h-9 px-3 rounded border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Admin', 'Manager', 'Analyst'] as MemberRole[]).map((roleOpt) => (
                    <label key={roleOpt} className="cursor-pointer">
                      <input
                        type="radio"
                        name="inviteRole"
                        value={roleOpt}
                        checked={inviteRole === roleOpt}
                        onChange={() => setInviteRole(roleOpt)}
                        className="peer sr-only"
                      />
                      <div className="py-2 rounded border border-slate-200 text-center text-xs font-medium text-slate-600 peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 transition-colors">
                        {roleOpt}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                An invitation token valid for 72 hours will be sent to the corporate inbox with
                instructions for workspace onboarding.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="flex-1 py-2 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviting}
                className="flex-1 py-2 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Permissions / Activity Detail Modal */}
      {inspectModal && (
        <div
          onClick={() => setInspectModal(null)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {inspectModal.mode === 'permissions' ? 'Effective Permissions' : 'Recent Activity'}
              </span>
              <button
                type="button"
                onClick={() => setInspectModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{inspectModal.member.name}</h3>
              <p className="text-xs text-slate-500">
                {inspectModal.member.email} · {inspectModal.member.role}
              </p>
            </div>
            {inspectModal.mode === 'permissions' ? (
              <ul className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <li>Read Executive Dashboard &amp; Regional SLAs: Enabled</li>
                <li>
                  Execute Operational Directives:{' '}
                  {inspectModal.member.role === 'Analyst' ? 'Read-only' : 'Authorized'}
                </li>
                <li>
                  Billing &amp; Seat Governance:{' '}
                  {inspectModal.member.role === 'Admin' ? 'Full Control' : 'Restricted'}
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <li className="flex justify-between">
                  <span>Reviewed Q3 Sales Pipeline Brief</span>
                  <span className="text-slate-400">Today</span>
                </li>
                <li className="flex justify-between">
                  <span>Exported Regional SLA Snapshot</span>
                  <span className="text-slate-400">Yesterday</span>
                </li>
              </ul>
            )}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setInspectModal(null)}
                className="px-3.5 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold"
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
