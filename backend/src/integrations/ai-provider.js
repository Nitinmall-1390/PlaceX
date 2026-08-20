/**
 * PlaceX — Base AI Provider Abstract Interface
 * Decouples PlaceX business logic from any specific AI/LLM vendor.
 */
export class AIProvider {
  /**
   * Provider identifier (e.g. 'gemini', 'anthropic', 'openai')
   */
  get providerName() {
    throw new Error('AIProvider.providerName getter must be implemented');
  }

  /**
   * Model identifier (e.g. 'gemini-2.5-flash', 'gpt-4o')
   */
  get modelName() {
    throw new Error('AIProvider.modelName getter must be implemented');
  }

  /**
   * Health/configuration status
   */
  isConfigured() {
    throw new Error('AIProvider.isConfigured must be implemented');
  }

  /**
   * Generate text response from prompt
   * @param {string} prompt
   * @param {object} [options]
   * @returns {Promise<string>}
   */
  async generateText(prompt, options = {}) {
    throw new Error('AIProvider.generateText must be implemented');
  }

  /**
   * Generate structured JSON response from prompt
   * @param {string} prompt
   * @param {object} [schema]
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async generateStructured(prompt, schema = {}, options = {}) {
    throw new Error('AIProvider.generateStructured must be implemented');
  }
}
