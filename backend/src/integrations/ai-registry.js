import { geminiService } from './gemini/gemini.service.js';

class AIRegistry {
  constructor() {
    this.providers = new Map();
    this.register('gemini', geminiService);
    this.defaultProvider = 'gemini';
  }

  register(name, provider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  getProvider(name = this.defaultProvider) {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`AI Provider "${name}" is not registered`);
    }
    return provider;
  }

  getAllMetrics() {
    const metrics = {};
    for (const [name, provider] of this.providers.entries()) {
      metrics[name] = typeof provider.getMetrics === 'function' ? provider.getMetrics() : { name };
    }
    return metrics;
  }
}

export const aiRegistry = new AIRegistry();
