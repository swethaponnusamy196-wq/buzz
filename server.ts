import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { loadWorkspace, saveWorkspace } from './server/store.ts';
import type { ChatMessage, CopilotContext, MemberRole, ReportRecord, TeamMember } from './src/types.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(nameOrEmail: string): string {
  const clean = nameOrEmail.split('@')[0].replace(/[._-]+/g, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || 'TM';
}

function formatNameFromEmail(email: string): string {
  const local = email.split('@')[0];
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', persistence: 'json-store' });
  });

  app.get('/api/workspace', async (_req, res) => {
    try {
      const state = await loadWorkspace();
      res.json(state);
    } catch (error) {
      console.error('Failed to load workspace:', error);
      res.status(500).json({ error: 'Failed to load workspace state.' });
    }
  });

  app.post('/api/directive/execute', async (_req, res) => {
    try {
      const state = await loadWorkspace();
      state.metrics.directiveCallout.executed = !state.metrics.directiveCallout.executed;
      state.metrics.syncedLabel = 'Synced just now';
      await saveWorkspace(state);
      res.json(state);
    } catch (error) {
      console.error('Failed to execute directive:', error);
      res.status(500).json({ error: 'Failed to update directive status.' });
    }
  });

  app.post('/api/suggestions/:id/execute', async (req, res) => {
    try {
      const state = await loadWorkspace();
      const target = state.suggestions.find((s) => s.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'Suggestion not found.' });
        return;
      }
      target.executed = !target.executed;
      state.metrics.syncedLabel = 'Synced just now';
      await saveWorkspace(state);
      res.json(state);
    } catch (error) {
      console.error('Failed to execute suggestion:', error);
      res.status(500).json({ error: 'Failed to update suggestion status.' });
    }
  });

  app.post('/api/suggestions/:id/bookmark', async (req, res) => {
    try {
      const state = await loadWorkspace();
      const target = state.suggestions.find((s) => s.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'Suggestion not found.' });
        return;
      }
      target.bookmarked = !target.bookmarked;
      await saveWorkspace(state);
      res.json(state);
    } catch (error) {
      console.error('Failed to bookmark suggestion:', error);
      res.status(500).json({ error: 'Failed to toggle bookmark.' });
    }
  });

  app.post('/api/members/invite', async (req, res) => {
    try {
      const { email, role } = req.body as { email?: string; role?: MemberRole };
      if (!email || !email.includes('@')) {
        res.status(400).json({ error: 'Please provide a valid corporate email address.' });
        return;
      }
      const state = await loadWorkspace();
      const normalized = email.trim().toLowerCase();
      if (state.members.some((m) => m.email.toLowerCase() === normalized)) {
        res.status(409).json({ error: 'A team member with this email is already in the workspace.' });
        return;
      }
      const newMember: TeamMember = {
        id: `mem-${Date.now()}`,
        name: formatNameFromEmail(normalized),
        email: normalized,
        initials: getInitials(normalized),
        role: 'Pending',
        title: `Invited as ${role || 'Manager'}`,
        isOnline: false,
        invitedAgo: 'Invited just now',
      };
      state.members.push(newMember);
      await saveWorkspace(state);
      res.status(201).json({ state, member: newMember });
    } catch (error) {
      console.error('Failed to invite member:', error);
      res.status(500).json({ error: 'Failed to invite team member.' });
    }
  });

  app.patch('/api/members/:id/role', async (req, res) => {
    try {
      const { role } = req.body as { role?: MemberRole };
      if (!role || !['Admin', 'Manager', 'Analyst', 'Pending'].includes(role)) {
        res.status(400).json({ error: 'Invalid role selection.' });
        return;
      }
      const state = await loadWorkspace();
      const member = state.members.find((m) => m.id === req.params.id);
      if (!member) {
        res.status(404).json({ error: 'Team member not found.' });
        return;
      }
      member.role = role;
      await saveWorkspace(state);
      res.json(state);
    } catch (error) {
      console.error('Failed to update role:', error);
      res.status(500).json({ error: 'Failed to update member role.' });
    }
  });

  app.post('/api/members/:id/resend', async (req, res) => {
    try {
      const state = await loadWorkspace();
      const member = state.members.find((m) => m.id === req.params.id);
      if (!member) {
        res.status(404).json({ error: 'Team member not found.' });
        return;
      }
      member.invitedAgo = 'Resent just now';
      await saveWorkspace(state);
      res.json(state);
    } catch (error) {
      console.error('Failed to resend invite:', error);
      res.status(500).json({ error: 'Failed to resend invitation.' });
    }
  });

  app.patch('/api/security', async (req, res) => {
    try {
      const { enforceTwoFactor, domainAutoJoin } = req.body as {
        enforceTwoFactor?: boolean;
        domainAutoJoin?: boolean;
      };
      const state = await loadWorkspace();
      if (typeof enforceTwoFactor === 'boolean') {
        state.securitySettings.enforceTwoFactor = enforceTwoFactor;
      }
      if (typeof domainAutoJoin === 'boolean') {
        state.securitySettings.domainAutoJoin = domainAutoJoin;
      }
      await saveWorkspace(state);
      res.json(state);
    } catch (error) {
      console.error('Failed to update security settings:', error);
      res.status(500).json({ error: 'Failed to update security policies.' });
    }
  });

  app.patch('/api/preferences', async (req, res) => {
    try {
      const { workspaceName, region, digestCadence } = req.body as {
        workspaceName?: string;
        region?: string;
        digestCadence?: 'Daily' | 'Weekly' | 'Real-time';
      };
      const state = await loadWorkspace();
      if (workspaceName?.trim()) state.preferences.workspaceName = workspaceName.trim();
      if (region?.trim()) state.preferences.region = region.trim();
      if (digestCadence) state.preferences.digestCadence = digestCadence;
      await saveWorkspace(state);
      res.json(state);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      res.status(500).json({ error: 'Failed to save workspace preferences.' });
    }
  });

  app.post('/api/dataset/import', async (req, res) => {
    try {
      const { filename, recordCount, efficiencyDelta } = req.body as {
        filename?: string;
        recordCount?: number;
        efficiencyDelta?: number;
      };
      const state = await loadWorkspace();
      const count = Number(recordCount) || 24;
      state.metrics.tasks.value += count;
      state.metrics.syncedLabel = 'Synced just now';
      if (typeof efficiencyDelta === 'number' && !Number.isNaN(efficiencyDelta)) {
        const current = parseFloat(state.metrics.efficiency.value) || 94.2;
        const nextVal = Math.min(99.9, Math.max(70, current + efficiencyDelta)).toFixed(1);
        state.metrics.efficiency.value = `${nextVal}%`;
      }
      state.briefingFeed.unshift({
        id: `brief-${Date.now()}`,
        category: 'Data Sync',
        timestamp: 'Just now',
        title: `Imported ${filename || 'operational_dataset.csv'}`,
        summary: `Ingested ${count} verified operational records into Q3 Week 8 telemetry model.`,
        footerLeft: 'Schema validated',
        hasGreenDot: true,
        fullReport: `Dataset "${filename || 'operational_dataset.csv'}" was parsed and reconciled with active ERP and SLA metrics (${count} records processed).`,
      });
      await saveWorkspace(state);
      res.json(state);
    } catch (error) {
      console.error('Failed to import dataset:', error);
      res.status(500).json({ error: 'Failed to import dataset.' });
    }
  });

  app.post('/api/reports/generate', async (req, res) => {
    try {
      const { topic, category } = req.body as { topic?: string; category?: string };
      const state = await loadWorkspace();
      const reportTitle = topic?.trim() || 'Executive Operational Pulse Brief';
      const reportCategory = category?.trim() || 'Operations';

      const ai = getGeminiClient();
      let summary = `Executive synthesis covering ${state.metrics.efficiency.value} operational efficiency, ${state.metrics.tasks.value} active weekly tasks, and ${state.suggestions.filter((s) => !s.executed).length} pending strategic directives.`;
      let highlights = [
        `Operational Efficiency holding at ${state.metrics.efficiency.value} (${state.metrics.efficiency.delta}).`,
        `Customer Sentiment averaging ${state.metrics.sentiment.value} / 5.0 across ${state.metrics.sentiment.reviews}.`,
        `Weekly Health Index peaked at ${state.healthIndex.week.peakLabel}.`,
      ];

      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: `Generate a concise 2-sentence executive summary and 3 crisp bullet highlights for an internal business report titled "${reportTitle}" (Category: ${reportCategory}). Base it on these live workspace metrics: Efficiency ${state.metrics.efficiency.value}, Sentiment ${state.metrics.sentiment.value}/5.0, Weekly Tasks ${state.metrics.tasks.value}, Active Directives ${state.suggestions.length}. Return plain JSON with keys "summary" (string) and "highlights" (string array of 3 items).`,
            config: {
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });
          if (response.text) {
            const parsed = JSON.parse(response.text) as { summary?: string; highlights?: string[] };
            if (parsed.summary) summary = parsed.summary;
            if (Array.isArray(parsed.highlights) && parsed.highlights.length > 0) {
              highlights = parsed.highlights.slice(0, 4);
            }
          }
        } catch (aiErr) {
          console.warn('Gemini report enrichment fallback:', aiErr);
        }
      }

      const newReport: ReportRecord = {
        id: `rep-${Date.now()}`,
        title: reportTitle,
        category: reportCategory,
        pages: Math.floor(Math.random() * 6) + 5,
        updatedAt: 'Just now',
        author: 'Biz Assist Engine',
        summary,
        highlights,
      };
      state.reports.unshift(newReport);
      await saveWorkspace(state);
      res.status(201).json({ state, report: newReport });
    } catch (error) {
      console.error('Failed to generate report:', error);
      res.status(500).json({ error: 'Failed to generate executive report.' });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { prompt, context } = req.body as {
        prompt?: string;
        context?: CopilotContext;
      };
      if (!prompt || !prompt.trim()) {
        res.status(400).json({ error: 'Message cannot be empty.' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to query Executive Copilot.',
        });
        return;
      }

      const state = await loadWorkspace();
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-u`,
        role: 'user',
        senderName: 'Sarah (COO)',
        timestamp: formatNowTime(),
        text: prompt.trim(),
      };

      const workspaceContext = `
Current Executive Workspace Telemetry:
- Efficiency: ${state.metrics.efficiency.value} (${state.metrics.efficiency.delta}, ${state.metrics.efficiency.target})
- Customer Sentiment: ${state.metrics.sentiment.value}/5.0 (${state.metrics.sentiment.reviews})
- Weekly Tasks: ${state.metrics.tasks.value} (${state.metrics.tasks.velocity}, ${state.metrics.tasks.pending} pending)
- Pending Strategic Levers: ${state.suggestions
        .map((s) => `${s.title} (${s.executed ? 'Executed' : 'Pending'})`)
        .join('; ')}
- Active Team Roster: ${state.members.length} members shown (${state.totalSeats} total seats)
- Active Domain Context: ${context || 'Operations & Logistics'}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `${workspaceContext}\n\nExecutive Question from Sarah (COO): ${prompt.trim()}`,
        config: {
          systemInstruction:
            'You are Biz Assist Executive Copilot advising Sarah (COO) in an enterprise operations workspace. Deliver crisp, actionable, quantitative analysis grounded in the provided workspace telemetry. Avoid fluff or generic disclaimers. Keep responses concise (3-5 crisp bullet points or short structured paragraphs, under 180 words).',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({ error: 'Executive Copilot returned an empty response.' });
        return;
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        senderName: 'Biz Assist',
        timestamp: formatNowTime(),
        text: replyText,
        feedback: null,
      };

      state.chatMessages.push(userMsg, assistantMsg);
      await saveWorkspace(state);
      res.json({ state, userMessage: userMsg, assistantMessage: assistantMsg });
    } catch (error: unknown) {
      console.error('Gemini chat error:', error);
      const errObj = error as { status?: number; message?: string };
      const status = errObj?.status && errObj.status >= 400 && errObj.status < 600 ? errObj.status : 500;
      res.status(status).json({
        error: errObj?.message || 'Failed to query Executive Copilot.',
      });
    }
  });

  app.patch('/api/chat/:id/feedback', async (req, res) => {
    try {
      const { feedback } = req.body as { feedback?: 'up' | 'down' | null };
      const state = await loadWorkspace();
      const msg = state.chatMessages.find((m) => m.id === req.params.id);
      if (!msg) {
        res.status(404).json({ error: 'Message not found.' });
        return;
      }
      msg.feedback = feedback ?? null;
      await saveWorkspace(state);
      res.json(state);
    } catch (error) {
      console.error('Failed to save chat feedback:', error);
      res.status(500).json({ error: 'Failed to save feedback.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Biz Assist server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
