import { aiCostEstimator } from './aiCostEstimator';

export interface AiRequestLog {
  id: string;
  timestamp: number;
  feature: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  responseTime: number;
  success: boolean;
  error?: string;
  requestPayload?: unknown;
  responsePayload?: unknown;
  estimatedCostCzk: number;
}

export interface FeatureStats {
  featureName: string;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostCzk: number;
  averageResponseTime: number;
}

export interface AiStats {
  todayRequests: number;
  todayTokens: number;
  todayCostCzk: number;
  averageResponseTime: number;
  currentProvider: string;
  currentModel: string;
}

const STORAGE_KEY = 'ai_control_center_logs';
const BUDGET_KEY = 'ai_control_center_budget';

export const aiAnalyticsService = {
  /**
   * Logs a new AI request.
   */
  async logRequest(entry: Omit<AiRequestLog, 'id' | 'estimatedCostCzk'>): Promise<AiRequestLog> {
    const cost = aiCostEstimator.calculateCostCzk(
      entry.provider,
      entry.model,
      entry.inputTokens,
      entry.outputTokens
    );

    const log: AiRequestLog = {
      ...entry,
      id: `req_${Math.random().toString(36).substring(2, 11)}`,
      estimatedCostCzk: cost,
    };

    // In a real Supabase setup, this would be:
    // await supabase.from('ai_logs').insert(log);
    
    // For local MVP / Observability, store in localStorage
    if (typeof window !== 'undefined') {
      try {
        const existingLogs = this.getRawLogs();
        existingLogs.push(log);
        // Keep logs capped to a reasonable number (e.g. 500) to prevent localStorage quota exhaustion
        if (existingLogs.length > 500) {
          existingLogs.shift();
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingLogs));
        
        // Dispatch custom event to notify listeners (e.g. the dashboard page) to re-render in real-time
        window.dispatchEvent(new Event('ai_log_updated'));
      } catch (err) {
        console.error('Failed to save AI log in localStorage:', err);
      }
    }

    return log;
  },

  /**
   * Helper to fetch raw logs from localStorage
   */
  getRawLogs(): AiRequestLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  /**
   * Clears all stored AI logs.
   */
  async clearLogs(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event('ai_log_updated'));
    }
  },

  /**
   * Gets the request history sorted by newest first.
   */
  async getHistory(): Promise<AiRequestLog[]> {
    const logs = this.getRawLogs();
    return [...logs].sort((a, b) => b.timestamp - a.timestamp);
  },

  /**
   * Gets stats for the dashboard.
   */
  async getStats(): Promise<AiStats> {
    const logs = this.getRawLogs();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const todayLogs = logs.filter(log => log.timestamp >= startOfToday);

    const todayRequests = todayLogs.length;
    const todayTokens = todayLogs.reduce((sum, log) => sum + (log.totalTokens || 0), 0);
    const todayCostCzk = todayLogs.reduce((sum, log) => sum + (log.estimatedCostCzk || 0), 0);

    const averageResponseTime = todayRequests > 0
      ? todayLogs.reduce((sum, log) => sum + log.responseTime, 0) / todayRequests
      : logs.length > 0
        ? logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length
        : 0;

    // Determine current provider & model from the most recent request
    let currentProvider = 'google';
    let currentModel = 'gemini-3.5-flash';

    if (logs.length > 0) {
      const latest = logs[logs.length - 1];
      currentProvider = latest.provider;
      currentModel = latest.model;
    }

    return {
      todayRequests,
      todayTokens,
      todayCostCzk,
      averageResponseTime,
      currentProvider,
      currentModel,
    };
  },

  /**
   * Gets statistics broken down by feature name.
   */
  async getFeatureBreakdown(): Promise<FeatureStats[]> {
    const logs = this.getRawLogs();
    const featuresMap: Record<string, AiRequestLog[]> = {};

    logs.forEach(log => {
      const f = log.feature || 'Ostatní';
      if (!featuresMap[f]) {
        featuresMap[f] = [];
      }
      featuresMap[f].push(log);
    });

    return Object.keys(featuresMap).map(featureName => {
      const featureLogs = featuresMap[featureName];
      const requestCount = featureLogs.length;
      const inputTokens = featureLogs.reduce((sum, log) => sum + (log.inputTokens || 0), 0);
      const outputTokens = featureLogs.reduce((sum, log) => sum + (log.outputTokens || 0), 0);
      const totalTokens = featureLogs.reduce((sum, log) => sum + (log.totalTokens || 0), 0);
      const estimatedCostCzk = featureLogs.reduce((sum, log) => sum + (log.estimatedCostCzk || 0), 0);
      const averageResponseTime = featureLogs.reduce((sum, log) => sum + log.responseTime, 0) / requestCount;

      return {
        featureName,
        requestCount,
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCostCzk,
        averageResponseTime,
      };
    });
  },

  /**
   * Budget management
   */
  getBudgetLimit(): number {
    if (typeof window === 'undefined') return 300;
    const limit = localStorage.getItem(BUDGET_KEY);
    return limit ? parseFloat(limit) : 300;
  },

  setBudgetLimit(limit: number): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BUDGET_KEY, limit.toString());
      window.dispatchEvent(new Event('ai_log_updated'));
    }
  },

  getMonthlyUsage(): number {
    const logs = this.getRawLogs();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const monthlyLogs = logs.filter(log => log.timestamp >= startOfMonth);
    return monthlyLogs.reduce((sum, log) => sum + (log.estimatedCostCzk || 0), 0);
  },
};
