import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const FALLBACK_ANSWER =
  "I don't know. The information is not available in the uploaded SOP documents.";

const SYSTEM_PROMPT = `You are SOP Agent, an assistant that answers questions strictly using the SOP (Standard Operating Procedure) excerpts provided in the context below.

Rules you must always follow:
1. Only use facts that appear in the provided context. Never use outside knowledge.
2. If the context does not contain enough information to answer the question, respond with EXACTLY this sentence and nothing else: "${FALLBACK_ANSWER}"
3. Keep answers concise and to the point. Use short paragraphs or a numbered/bulleted list when listing steps.
4. Do not mention "the context" or "the provided excerpts" in your answer - write as if you simply know the SOP.
5. Do not make up page numbers, document names, or procedures that are not in the context.`;

/**
 * Asks Groq a question, grounded only in the supplied context chunks.
 * @param {string} question
 * @param {{ text: string, pageNumber: number, documentName: string }[]} contextChunks
 * @returns {Promise<string>} the model's answer
 */
export async function askGroq(question, contextChunks) {
  const contextBlock = contextChunks
    .map(
      (c, i) =>
        `[Excerpt ${i + 1} | Document: "${c.documentName}" | Page ${c.pageNumber}]\n${c.text}`
    )
    .join('\n\n');

  const userPrompt = `Context:\n${contextBlock}\n\nQuestion: ${question}`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    temperature: 0.2,
    max_tokens: 600,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || FALLBACK_ANSWER;
}
