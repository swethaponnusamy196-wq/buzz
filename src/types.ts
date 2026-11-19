export type NavRoute =
  | 'dashboard'
  | 'ai-assistant'
  | 'smart-suggestions'
  | 'data-analysis'
  | 'reports'
  | 'user-management'
  | 'settings';

export type ChartPeriod = 'day' | 'week' | 'month';

export type SuggestionCategory = 'all' | 'growth' | 'operational' | 'governance';

export type MemberRole = 'Admin' | 'Manager' | 'Analyst' | 'Pending';

export type CopilotContext =
  | 'General Business'
  | 'Operations & Logistics'
  | 'Team & HR'
  | 'Strategy';

export interface ChartBar {
  label: string;
  value: number;
  highlight?: 'peak' | 'mid' | 'soft' | 'muted';
}

export interface HealthIndexSeries {
  peakLabel: string;
  deltaLabel: string;
  bars: ChartBar[];
}

export interface DashboardMetrics {
  efficiency: {
    value: string;
    delta: string;
    target: string;
    status: string;
  };
  sentiment: {
    value: string;
    scale: string;
    delta: string;
    reviews: string;
    percentile: string;
  };
  tasks: {
    value: number;
    period: string;
    velocity: string;
    pending: number;
  };
  directives: {
    value: number;
    status: string;
    highPriority: number;
  };
  directiveCallout: {
    title: string;
    roiLabel: string;
    description: string;
    savedHours: string;
    executed: boolean;
  };
  syncedLabel: string;
}

export interface BriefingFeedItem {
  id: string;
  category: string;
  timestamp: string;
  title: string;
  summary: string;
  footerLeft: string;
  hasGreenDot?: boolean;
  fullReport: string;
}

export interface SuggestionItem {
  id: string;
  category: 'growth' | 'operational' | 'governance';
  badgeLabel: string;
  badgeStyle: 'blue' | 'slate';
  department: string;
  title: string;
  abstract: string;
  highlightMetric: string;
  quantMode: 'comparison' | 'progress';
  beforeLabel?: string;
  beforeValue?: string;
  beforeSubtext?: string;
  afterLabel?: string;
  afterValue?: string;
  afterDelta?: string;
  afterSubtext?: string;
  progressLabel?: string;
  progressValue?: string;
  progressPercent?: number;
  progressCaption?: string;
  advisoryIcon: string;
  advisorySource: string;
  advisoryNote: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  executed: boolean;
  bookmarked: boolean;
  impactHours: number;
  impactArrK: number;
}

export interface BottleneckItem {
  number: string;
  title: string;
  tag: string;
  tagTone: 'rose' | 'slate';
  solution: string;
}

export interface StructuredSynthesis {
  title: string;
  subtitle: string;
  items: BottleneckItem[];
  metricLabel: string;
  metricValue: string;
  auditSource: string;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  senderName: string;
  timestamp: string;
  text: string;
  structuredSynthesis?: StructuredSynthesis;
  feedback?: 'up' | 'down' | null;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  role: MemberRole;
  title: string;
  isOwner?: boolean;
  isOnline?: boolean;
  invitedAgo?: string;
}

export interface SecuritySettings {
  enforceTwoFactor: boolean;
  domainAutoJoin: boolean;
}

export interface ReportRecord {
  id: string;
  title: string;
  category: string;
  pages: number;
  updatedAt: string;
  author: string;
  summary: string;
  highlights: string[];
}

export interface WorkspaceState {
  metrics: DashboardMetrics;
  healthIndex: Record<ChartPeriod, HealthIndexSeries>;
  briefingFeed: BriefingFeedItem[];
  suggestions: SuggestionItem[];
  chatMessages: ChatMessage[];
  members: TeamMember[];
  totalSeats: number;
  securitySettings: SecuritySettings;
  reports: ReportRecord[];
  preferences: {
    workspaceName: string;
    region: string;
    digestCadence: 'Daily' | 'Weekly' | 'Real-time';
    aiModelLabel: string;
  };
}
