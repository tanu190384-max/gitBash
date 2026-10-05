import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { buildUserPrompt, SYSTEM_PROMPT } from '../prompt.js';
import { aiAssessmentSchema, type AiAssessment, type AiAssessmentRequest, type AiProvider } from '../types.js';

/**
 * Anthropic-backed implementation of the AI assessment layer.
 * Every failure mode throws — the caller decides how to degrade.
 */
export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic';
  readonly model = env.AI_MODEL;
  private client: Anthropic | null = null;

  isConfigured(): boolean {
    return Boolean(env.AI_API_KEY);
  }

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({ apiKey: env.AI_API_KEY, maxRetries: 1, timeout: 30_000 });
    }
    return this.client;
  }

  async generateAssessment(input: AiAssessmentRequest): Promise<AiAssessment> {
    const response = await this.getClient().messages.create({
      model: this.model,
      max_tokens: 1600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(input) }],
    });

    if (response.stop_reason === 'refusal') {
      throw new Error('The model declined to analyse this report.');
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (!text) throw new Error('Empty response from the AI provider.');

    return aiAssessmentSchema.parse(extractJson(text));
  }
}

/**
 * Models sometimes wrap JSON in prose or a code fence. Pull out the first
 * balanced object rather than failing the whole assessment on formatting.
 */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error('AI response was not valid JSON.');
  }
}
