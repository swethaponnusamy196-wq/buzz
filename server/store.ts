import fs from 'fs/promises';
import path from 'path';
import type { WorkspaceState } from '../src/types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'workspace.json');

export const IMAGES = {
  sarahHeaderAvatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDZaRy-voUEC7KYKDXrzfoBs5LxlbDD9dtiN6-GwPTreb9NVpKXFw9QfXj1vawOlKqunU1NMUhrE_wjFNUpdibXRVd8RfavZhOmg9uskwjWuqJqbkM2TGxo_RBnlw62ZIufjLUHB_KBecn9CCRIAb95TcQSaD6Hcj0g1Ei6X7H3nfaNZ81ZwbWYMyW55n0KS05c1UX2hJGwh8MMu88t4urF9FdCdB98h6qyD5w8JWQs',
  brandLogo:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCxd5kGaNl0JFubd9VTaUpyrfUWT4HVlV_ThHfxlmBpzZoYGjoNpeeBlqQgrYNOfGDBFvud1Rl7O6fZy8SzXPH_47WK-0n10MKSmyCDhBxbY3DHDDUVJB4fe46RwWj62ri4jQWFTMU9-EPYsi5arfgwnQois83bQmn_WNTONfO3rmmo4NcCGjVL7IGeQioslro3iIJ1J__voZOfO0EAEig9lLzi5afmNa0I3vjLQhsu',
  quarterlyOutlookBanner:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBrZqlxyKA8UTGjG5SmDR-UgQpmisfShM0h791PYlm_w3ZKT-dFVhC0dtz9u9jHQw0o5GH3oLKMjMPsAhFqGvgDMWDTstqOZaQUquzoJ8c643QNRbHXftW1n1yDtXxCca-mnohe8OeAZIEj58djWi_9ohV8KSoplCWelnJjaKphqrejT1vWke0Wo1FgiZViTETlhDUj1vvHby0UrIXHGO-639ltqgAbYw-1XY0eUf3D',
  sarahChatAvatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBgXwpvkM0J5KDkhZdsuE-HO0CkIvVhAA5m8nK7NDb7QPm30Y0EfACm1Cqptqwenvpw8IitbGg1hsAU5ypP1wutUWw0fCsM32DEI1SPkzSWe7-R5H8eOUy8fyMAKXHAQ9qTAPzqQPIfUooRl2TA03O_cF8hmRzwTqkY0nPHOm_FzZxS0QSNKjoBI_TKv8AId3VRC0kcjniFY3t8c__eiEYsG45NeiyWrxZsS4C8FZNm',
  telemetryGraphic:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBPdQaTpiyJlp5gOhdW0CxU1m4lBGUYiJ5_8Zl7S1kTryhvkNGGN8pcnTQykDAml5kpoLtdbhvcqLL_tLYEKdcPxwIG48fUs9_oDY9WVQ33mxKaHw4qDIUQzmSSrlzWybS37Hs2CWiJ0i7ofsThH50Vx64t9_eWGme_pzKTo7Y2UQkBzmHJyTdznTjHUROlSenrcQKOUEnnhLr_HiRmVTa3c1nCf7Ve5kXGzc7vv47z',
};

export function createInitialWorkspaceState(): WorkspaceState {
  return {
    metrics: {
      efficiency: {
        value: '94.2%',
        delta: '+6.8%',
        target: 'Target: 90%',
        status: 'SLA Met',
      },
      sentiment: {
        value: '4.8',
        scale: '/ 5.0',
        delta: '+0.3',
        reviews: '3.4k reviews',
        percentile: 'Top decile',
      },
      tasks: {
        value: 142,
        period: 'WTD',
        velocity: 'Velocity +12%',
        pending: 18,
      },
      directives: {
        value: 38,
        status: 'Ready',
        highPriority: 4,
      },
      directiveCallout: {
        title: 'Automate client onboarding cadences',
        roiLabel: '+18% projected ROI',
        description:
          'Transitioning current high-touch touchpoints into automated workflow rules recovers approximately',
        savedHours: '4.5 hrs/week',
        executed: false,
      },
      syncedLabel: 'Synced 2m ago',
    },
    healthIndex: {
      day: {
        peakLabel: '14:00 Peak: 97.4 Index',
        deltaLabel: '11.2% above daily baseline',
        bars: [
          { label: '08h', value: 62, highlight: 'muted' },
          { label: '10h', value: 78, highlight: 'soft' },
          { label: '12h', value: 84, highlight: 'mid' },
          { label: '14h', value: 97, highlight: 'peak' },
          { label: '16h', value: 88, highlight: 'mid' },
          { label: '18h', value: 52, highlight: 'muted' },
          { label: '20h', value: 38, highlight: 'muted' },
        ],
      },
      week: {
        peakLabel: 'Thursday Peak: 96.8 Index',
        deltaLabel: '9.4% above median target',
        bars: [
          { label: 'M', value: 55, highlight: 'muted' },
          { label: 'T', value: 68, highlight: 'muted' },
          { label: 'W', value: 74, highlight: 'soft' },
          { label: 'T', value: 96, highlight: 'peak' },
          { label: 'F', value: 82, highlight: 'mid' },
          { label: 'S', value: 36, highlight: 'muted' },
          { label: 'S', value: 40, highlight: 'muted' },
        ],
      },
      month: {
        peakLabel: 'Week 3 Peak: 95.1 Index',
        deltaLabel: '7.8% above Q2 trailing avg',
        bars: [
          { label: 'W1', value: 71, highlight: 'muted' },
          { label: 'W2', value: 79, highlight: 'soft' },
          { label: 'W3', value: 95, highlight: 'peak' },
          { label: 'W4', value: 89, highlight: 'mid' },
          { label: 'W5', value: 86, highlight: 'mid' },
          { label: 'W6', value: 91, highlight: 'soft' },
          { label: 'W7', value: 94, highlight: 'mid' },
        ],
      },
    },
    briefingFeed: [
      {
        id: 'brief-ops-digest',
        category: 'Operations',
        timestamp: '2h ago',
        title: 'Weekly Operations Digest',
        summary:
          'Supply chain bottleneck resolved in Midwest regional depot. Client delivery SLA improved by 14% across all regional depots.',
        footerLeft: '3 sub-actions approved',
        hasGreenDot: true,
        fullReport:
          'Midwest regional depot carrier routing was rebalanced across 4 regional hubs, eliminating a 22-hour customs staging delay. Fulfillment SLA compliance moved from 80.2% to 94.2% across East, Midwest, South, and West corridors.',
      },
      {
        id: 'brief-sales-pipeline',
        category: 'Growth',
        timestamp: 'Yesterday',
        title: 'Q3 Sales Pipeline Brief',
        summary:
          'Enterprise inbound demo volume increased 28% following product release. Average sales conversion velocity shortened by 3 full days.',
        footerLeft: 'ARR model adjusted +$84k',
        hasGreenDot: false,
        fullReport:
          'Inbound Enterprise pipeline grew +28% WoW following the Q3 workflow automation release. Mid-funnel technical scoping dropped from 9.4 days to 6.4 days after introducing automated readiness checks.',
      },
    ],
    suggestions: [
      {
        id: 'sug-onboarding',
        category: 'growth',
        badgeLabel: 'Workflow Automation',
        badgeStyle: 'blue',
        department: 'Dept: Sales & Growth',
        title: 'Automate B2B Self-Service Client Onboarding',
        abstract:
          'Audit reveals a 38% drop-off threshold during manual KYC and scoping intake. Introducing an asynchronous AI intake engine compresses cycle times and reduces support friction.',
        highlightMetric: '38% drop-off threshold',
        quantMode: 'comparison',
        beforeLabel: 'Current State',
        beforeValue: '14.2 Days',
        beforeSubtext: 'Manual questionnaire flow',
        afterLabel: 'Targeted State',
        afterValue: '3.1 Days',
        afterDelta: '-78% Latency',
        afterSubtext: 'Automated document validation',
        advisoryIcon: 'account_circle',
        advisorySource: 'Vetted by Operations Principal · Confidence 92%',
        advisoryNote: 'Recommended for immediate rollout to Tier 2 accounts.',
        primaryActionLabel: 'Execute Playbook',
        secondaryActionLabel: 'Model Risk',
        executed: false,
        bookmarked: false,
        impactHours: 20.4,
        impactArrK: 0,
      },
      {
        id: 'sug-syncs',
        category: 'operational',
        badgeLabel: 'Internal Efficiency',
        badgeStyle: 'slate',
        department: 'Dept: Cross-Functional',
        title: 'Consolidate Recurring Cross-Department Syncs',
        abstract:
          'Calendar analytics report 6.4 engineering hours weekly dedicated to status relay meetings. Transition to structured asynchronous AI digests synced into core management hubs.',
        highlightMetric: '6.4 engineering hours weekly',
        quantMode: 'comparison',
        beforeLabel: 'Meeting Overhead',
        beforeValue: '4 Syncs/wk',
        beforeSubtext: 'High context-switching cost',
        afterLabel: 'Reclaimed Focus',
        afterValue: '+25.6 hrs',
        afterDelta: 'Monthly',
        afterSubtext: 'Deep work availability',
        advisoryIcon: 'fact_check',
        advisorySource: 'Audited by Governance Committee · Confidence 96%',
        advisoryNote: 'Zero impact on delivery milestone timelines.',
        primaryActionLabel: 'Activate Standup Automation',
        secondaryActionLabel: 'Preview Digest',
        executed: false,
        bookmarked: false,
        impactHours: 25.6,
        impactArrK: 0,
      },
      {
        id: 'sug-retention',
        category: 'growth',
        badgeLabel: 'Client Retention',
        badgeStyle: 'blue',
        department: 'Dept: Customer Success',
        title: 'Proactive Retention Triggers for At-Risk Enterprise Accounts',
        abstract:
          'Deploy early warning alerts when engagement sinks >20% below quarterly median, enabling preemptive partner check-ins prior to commercial renewal windows.',
        highlightMetric: '>20% below quarterly median',
        quantMode: 'progress',
        progressLabel: 'Target Capital Preservation',
        progressValue: '$14,200 ARR',
        progressPercent: 74,
        progressCaption: '3 accounts currently matched to engagement drift criteria',
        advisoryIcon: 'verified_user',
        advisorySource: 'Strategy Lead Verified · Confidence 89%',
        advisoryNote: 'Integrates directly into existing CRM outreach workflows.',
        primaryActionLabel: 'Deploy Retention Triggers',
        executed: false,
        bookmarked: false,
        impactHours: 0,
        impactArrK: 14.2,
      },
    ],
    chatMessages: [
      {
        id: 'msg-intro',
        role: 'assistant',
        senderName: 'Biz Assist',
        timestamp: '09:41 AM',
        text: 'Hello Sarah. I have updated your operational synthesis with the latest sprint cycles, ERP logs, and vendor milestones. What strategic decision or operational hurdle are we addressing today?',
      },
      {
        id: 'msg-user-1',
        role: 'user',
        senderName: 'Sarah (COO)',
        timestamp: '09:42 AM',
        text: 'What are our top 3 operational bottlenecks this month and how can we address them without adding headcount?',
      },
      {
        id: 'msg-assistant-1',
        role: 'assistant',
        senderName: 'Analysis & Synthesis',
        timestamp: 'Just now',
        text: 'Aggregated across 142 tickets, Jira sprint cadence, and ERP invoice tracking.',
        feedback: null,
        structuredSynthesis: {
          title: 'Top 3 Operational Bottlenecks',
          subtitle:
            'Aggregated across 142 tickets, Jira sprint cadence, and ERP invoice tracking. Total estimated capacity loss: 58 hours/week.',
          items: [
            {
              number: '01',
              title: 'Client Intake Handoff',
              tag: 'Avg delay: 34h',
              tagTone: 'rose',
              solution:
                'Implement standardized schema verification on intake forms. Incomplete payloads are held at submission, preventing premature PM queueing.',
            },
            {
              number: '02',
              title: 'Vendor Invoice PO Review',
              tag: 'Manual review',
              tagTone: 'slate',
              solution:
                'Auto-approve purchase orders matching contract terms within a ±1.5% variance threshold; route only exceptions to finance directors.',
            },
            {
              number: '03',
              title: 'Cross-Team Status Synchronizations',
              tag: '11h/person/wk',
              tagTone: 'slate',
              solution:
                'Replace 2 recurring syncs with an automated asynchronous brief. Escalate to live discussion only when risk thresholds trip.',
            },
          ],
          metricLabel: 'Projected Recaptured Focus',
          metricValue: '+22% Weekly Capacity',
          auditSource: 'Derived from 142 tickets & ERP audit logs',
        },
      },
    ],
    members: [
      {
        id: 'mem-sarah',
        name: 'Sarah Jenkins',
        email: 'sarah@horizon.com',
        initials: 'SJ',
        avatarUrl: IMAGES.sarahHeaderAvatar,
        role: 'Admin',
        title: 'Workspace Owner',
        isOwner: true,
        isOnline: true,
      },
      {
        id: 'mem-marcus',
        name: 'Marcus Chen',
        email: 'marcus@horizon.com',
        initials: 'MC',
        role: 'Manager',
        title: 'Operations Manager',
        isOnline: true,
      },
      {
        id: 'mem-amara',
        name: 'Amara Patel',
        email: 'amara@horizon.com',
        initials: 'AP',
        role: 'Analyst',
        title: 'Business Analyst',
        isOnline: true,
      },
      {
        id: 'mem-david',
        name: 'David Kim',
        email: 'david.k@horizon.com',
        initials: 'DK',
        role: 'Manager',
        title: 'Department Lead',
        isOnline: true,
      },
      {
        id: 'mem-elena',
        name: 'Elena Vance',
        email: 'elena@horizon.com',
        initials: 'EV',
        role: 'Pending',
        title: 'Invited Member',
        isOnline: false,
        invitedAgo: 'Invited 2 days ago',
      },
    ],
    totalSeats: 25,
    securitySettings: {
      enforceTwoFactor: true,
      domainAutoJoin: false,
    },
    reports: [
      {
        id: 'rep-quarterly-outlook',
        title: 'Executive Quarterly Outlook',
        category: 'Briefing Document',
        pages: 14,
        updatedAt: 'Aug 24, 2026',
        author: 'Strategy Office',
        summary:
          'Macro scenarios, regional fulfillment SLA distribution, and headcount allocation models for Q3–Q4.',
        highlights: [
          'Operational efficiency reached 94.2% (+6.8% QoQ) without incremental headcount.',
          'Midwest depot latency reduced by 14% following carrier rebalancing.',
          'Projected $84k ARR expansion from shortened enterprise technical scoping.',
        ],
      },
      {
        id: 'rep-ops-digest',
        title: 'Weekly Operations Digest',
        category: 'Operations',
        pages: 6,
        updatedAt: '2 hours ago',
        author: 'Biz Assist Engine',
        summary:
          'Supply chain bottleneck resolution summary and regional SLA telemetry across 4 hubs.',
        highlights: [
          '3 automated sub-actions approved across Midwest and East depots.',
          '142 weekly tasks completed (+12% velocity vs prior 4-week rolling mean).',
        ],
      },
      {
        id: 'rep-sales-pipeline',
        title: 'Q3 Sales Pipeline Brief',
        category: 'Growth',
        pages: 9,
        updatedAt: 'Yesterday',
        author: 'Revenue Operations',
        summary:
          'Enterprise inbound demo surge analysis and conversion cycle compression modeling.',
        highlights: [
          '28% increase in qualified enterprise demos following Q3 release.',
          'Sales conversion velocity improved by 3.0 full days.',
        ],
      },
    ],
    preferences: {
      workspaceName: 'Executive Workspace',
      region: 'Enterprise • US-East',
      digestCadence: 'Daily',
      aiModelLabel: 'Model 4.1 (gemini-4-hydrogen)',
    },
  };
}

let memoryCache: WorkspaceState | null = null;

export async function loadWorkspace(): Promise<WorkspaceState> {
  if (memoryCache) return memoryCache;
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    memoryCache = JSON.parse(raw) as WorkspaceState;
    return memoryCache;
  } catch {
    const initial = createInitialWorkspaceState();
    memoryCache = initial;
    await saveWorkspace(initial);
    return initial;
  }
}

export async function saveWorkspace(next: WorkspaceState): Promise<WorkspaceState> {
  memoryCache = next;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(next, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not persist workspace JSON to disk, continuing in memory:', err);
  }
  return next;
}
