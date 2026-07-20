import { providerFactory } from './providerFactory';
import { promptBuilder } from './promptBuilder';
import { AiRequest, AiResponse, AiModelConfig, AiContext, AiMessage } from './types';
import { Card, Column } from '../../types/kanban';
import { improveTaskSchema, backlogGenerateSchema, projectGenerateSchema, sprintPlanningSchema, projectRiskAnalysisSchema } from './schemas';

// Jednoduché lokální logování AI requestů na serveru
function logAiRequest(
  action: string,
  model: string,
  startTime: number,
  success: boolean,
  extra: Record<string, unknown>
) {
  const duration = Date.now() - startTime;
  // Serverové observability logování jen mimo produkci (čisté produkční logy).
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[AI SERVICE LOG] ${new Date().toISOString()} | Action: ${action} | Model: ${model} | Duration: ${duration}ms | Success: ${success}`,
      JSON.stringify(extra)
    );
  }
}

export const aiService = {
  // Převede systémové chybové kódy na uživatelsky čitelné texty
  getFriendlyError(err: Error): string {
    const msg = err.message;
    if (msg.includes('GEMINI_API_KEY_MISSING')) {
      return 'Není nastaven API klíč pro Gemini. Konfigurujte prosím GEMINI_API_KEY v souboru .env.local.';
    }
    if (msg.includes('GEMINI_INVALID_API_KEY')) {
      return 'API klíč pro Gemini je neplatný. Zkontrolujte prosím konfiguraci.';
    }
    if (msg.includes('GEMINI_RATE_LIMIT')) {
      return 'Byl překročen limit dotazů pro Gemini. Zkuste to prosím za chvíli.';
    }
    if (msg.includes('GEMINI_TIMEOUT')) {
      return 'Požadavek na Gemini vypršel (timeout). Zkuste to prosím znovu.';
    }
    if (msg.includes('GEMINI_NETWORK_ERROR')) {
      return 'Chyba síťového připojení k Gemini. Zkontrolujte prosím připojení k internetu.';
    }
    return `Chyba AI služby: ${msg}`;
  },

  // Společná obálka pro vykonání požadavků přes zvoleného providera s logováním a ošetřením chyb
  async _execute(
    actionName: string,
    messages: AiMessage[],
    config: AiModelConfig
  ): Promise<AiResponse> {
    const startTime = Date.now();
    try {
      const provider = providerFactory.getProvider();
      const response = await provider.generateCompletion(messages, config);
      logAiRequest(actionName, config.model, startTime, true, {
        promptTokens: response.usage?.promptTokens ?? 0,
        completionTokens: response.usage?.completionTokens ?? 0,
      });
      return response;
    } catch (err: unknown) {
      const error = err as Error;
      logAiRequest(actionName, config.model, startTime, false, { error: error.message });
      throw new Error(this.getFriendlyError(error));
    }
  },

  // 1. AI Chat
  async executeChat(req: AiRequest): Promise<AiResponse> {
    const config: AiModelConfig = {
      model: req.config?.model || process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      temperature: req.config?.temperature ?? 0.7,
      maxTokens: req.config?.maxTokens ?? 2000,
      systemPrompt: req.config?.systemPrompt,
    };
    const messages = promptBuilder.buildChatPrompt(req.messages, req.context);
    return this._execute('chat', messages, config);
  },

  // 2. AI Task Generation (Tvorba nového úkolu)
  async executeTaskGenerate(topic: string, context?: AiContext): Promise<AiResponse> {
    const config: AiModelConfig = {
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      temperature: 0.3,
    };
    const messages = promptBuilder.buildTaskGeneratePrompt(topic, context);
    return this._execute('task_generate', messages, config);
  },

  // 3. AI Improve Task (Vylepšení zadání)
  async executeTaskImprove(card: Card, context?: AiContext): Promise<AiResponse> {
    const config: AiModelConfig = {
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      temperature: 0.3,
      responseSchema: improveTaskSchema,
    };
    const messages = promptBuilder.buildTaskImprovePrompt(card, context);
    return this._execute('task_improve', messages, config);
  },

  // 4. AI Split Task (Rozdělení úkolu)
  async executeTaskSplit(card: Card, context?: AiContext): Promise<AiResponse> {
    const config: AiModelConfig = {
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      temperature: 0.2,
    };
    const messages = promptBuilder.buildTaskSplitPrompt(card, context);
    return this._execute('task_split', messages, config);
  },

  // 5. AI Sprint Planning (Plánování sprintů)
  async executeSprintPlanning(cards: Card[], context?: AiContext): Promise<AiResponse> {
    const config: AiModelConfig = {
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      temperature: 0.5,
      maxTokens: 4000,
      responseSchema: sprintPlanningSchema,
      // Nejtěžší strukturovaná generace -> delší timeout (+ provider dělá 1 retry).
      timeoutMs: 55000,
    };
    const messages = promptBuilder.buildSprintPlanningPrompt(cards, context);
    return this._execute('sprint_planning', messages, config);
  },

  // 6. AI Search (Vyhledávání)
  async executeSearch(query: string, cards: Card[]): Promise<AiResponse> {
    const config: AiModelConfig = {
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      temperature: 0.1,
    };
    const messages = promptBuilder.buildSearchPrompt(query, cards);
    return this._execute('search', messages, config);
  },

  // 7. AI Summary (Shrnutí úkolu)
  async executeSummary(card: Card): Promise<AiResponse> {
    const config: AiModelConfig = {
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      temperature: 0.3,
    };
    const messages = promptBuilder.buildSummaryPrompt(card);
    return this._execute('summary', messages, config);
  },

  // 8. AI Backlog Generation (Generování backlogu)
  async executeBacklogGenerate(
    projectName: string,
    projectDescription: string,
    columns: Column[],
    existingTasks: Card[],
    options?: { taskCount?: number; detailLevel?: string; technologies?: string }
  ): Promise<AiResponse> {
    const config: AiModelConfig = {
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      temperature: 0.3,
      maxTokens: 4000,
      responseSchema: backlogGenerateSchema,
    };
    const messages = promptBuilder.buildBacklogGeneratePrompt(
      projectName,
      projectDescription,
      columns,
      existingTasks,
      options
    );
    return this._execute('backlog_generate', messages, config);
  },

  // 9. AI Project Generation (Generování celého projektu)
  async executeProjectGenerate(
    projectName?: string,
    projectDescription?: string,
    projectType?: string,
    technologies?: string,
    detailLevel?: string,
    taskCount?: number
  ): Promise<AiResponse> {
    const config: AiModelConfig = {
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      temperature: 0.3,
      maxTokens: 4000,
      responseSchema: projectGenerateSchema,
    };
    const messages = promptBuilder.buildProjectGeneratePrompt(
      projectName,
      projectDescription,
      projectType,
      technologies,
      detailLevel,
      taskCount
    );
    return this._execute('project_generate', messages, config);
  },

  // 10. AI Risk Analysis
  async executeRiskAnalysis(
    projectName: string,
    columns: Column[],
    context?: AiContext
  ): Promise<AiResponse> {
    const config: AiModelConfig = {
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      temperature: 0.3,
      maxTokens: 4000,
      responseSchema: projectRiskAnalysisSchema,
    };
    const messages = promptBuilder.buildRiskAnalysisPrompt(projectName, columns, context);
    return this._execute('risk_analysis', messages, config);
  },
};
