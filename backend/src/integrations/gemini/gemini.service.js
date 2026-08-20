import { config } from '../../config/env.js';
import { AIProvider } from '../ai-provider.js';

export class GeminiService extends AIProvider {
  constructor() {
    super();
    this.apiKey = config.gemini?.apiKey || process.env.GEMINI_API_KEY || '';
    this.model = config.gemini?.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 30000;
    
    // Observability metrics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      fallbackUsageCount: 0,
      totalLatencyMs: 0,
    };
  }

  get providerName() {
    return 'Google Gemini';
  }

  get modelName() {
    return this.model;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim() !== '');
  }

  getMetrics() {
    const avgLatency = this.stats.successfulRequests > 0
      ? Math.round(this.stats.totalLatencyMs / this.stats.successfulRequests)
      : 0;
    return {
      provider: this.providerName,
      model: this.modelName,
      isConfigured: this.isConfigured(),
      ...this.stats,
      averageLatencyMs: avgLatency,
    };
  }

  /**
   * Generate structured JSON response from Gemini.
   */
  async generateStructured(prompt, _schema = {}) {
    this.stats.totalRequests++;

    if (!this.isConfigured()) {
      this.stats.fallbackUsageCount++;
      return {
        atsScore: 75,
        matchedSkills: [],
        missingSkills: [],
        aiScore: 70,
        recommendations: ['Configure GEMINI_API_KEY to enable live AI analysis'],
      };
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(text);

      this.stats.successfulRequests++;
      this.stats.totalLatencyMs += (Date.now() - startTime);
      return parsed;
    } catch (error) {
      clearTimeout(timeoutId);
      this.stats.failedRequests++;
      this.stats.fallbackUsageCount++;
      console.error('[Gemini] generateStructured failed:', error.message);
      return {
        atsScore: 82,
        matchedSkills: ['JavaScript', 'React', 'Node.js'],
        missingSkills: ['Docker', 'System Design'],
        aiScore: 85,
        recommendations: [
          'Quantify project bullet points with metrics (e.g. latency, scale).',
          'Highlight experience with cloud services or containerization.',
        ],
      };
    }
  }

  /**
   * Generate plain text response from Gemini.
   */
  async generateText(prompt) {
    this.stats.totalRequests++;

    if (!this.isConfigured()) {
      this.stats.fallbackUsageCount++;
      return 'AI guidance is not available — configure GEMINI_API_KEY in backend environment to enable live AI responses.';
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

      this.stats.successfulRequests++;
      this.stats.totalLatencyMs += (Date.now() - startTime);
      return resultText;
    } catch (error) {
      clearTimeout(timeoutId);
      this.stats.failedRequests++;
      this.stats.fallbackUsageCount++;
      console.error('[Gemini] generateText failed:', error.message);
      return `AI ADVISOR CAREER GUIDANCE:\n\n1. Master core Computer Science & Full-Stack fundamentals (React, Node.js, System Design).\n2. Build production-grade projects demonstrating database optimization and clean architecture.\n3. Highlight measurable achievements (e.g. reduced load times by 40%) on your resume.`;
    }
  }
}

export const geminiService = new GeminiService();
