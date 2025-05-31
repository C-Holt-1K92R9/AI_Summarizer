'use server';

/**
 * @fileOverview Extracts key sentences from a document summary.
 *
 * - extractKeySentences - A function that handles the extraction of key sentences.
 * - KeySentenceExtractionInput - The input type for the extractKeySentences function.
 * - KeySentenceExtractionOutput - The return type for the extractKeySentences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KeySentenceExtractionInputSchema = z.object({
  documentSummary: z
    .string()
    .describe('A summary of the document from which to extract key sentences.'),
});
export type KeySentenceExtractionInput = z.infer<
  typeof KeySentenceExtractionInputSchema
>;

const KeySentenceExtractionOutputSchema = z.object({
  keySentences: z
    .string()
    .describe(
      'Key sentences extracted from the document summary, separated by newlines.'
    ),
});
export type KeySentenceExtractionOutput = z.infer<
  typeof KeySentenceExtractionOutputSchema
>;

export async function extractKeySentences(
  input: KeySentenceExtractionInput
): Promise<KeySentenceExtractionOutput> {
  return extractKeySentencesFlow(input);
}

const extractKeySentencesPrompt = ai.definePrompt({
  name: 'extractKeySentencesPrompt',
  input: {schema: KeySentenceExtractionInputSchema},
  output: {schema: KeySentenceExtractionOutputSchema},
  prompt: `You are an expert in extracting the most important sentences from a text.

  Given the following document summary, extract the key sentences that encapsulate the core arguments or findings.
  Separate each sentence with a newline character.\n\n  Document Summary: {{{documentSummary}}}`,
});

const extractKeySentencesFlow = ai.defineFlow(
  {
    name: 'extractKeySentencesFlow',
    inputSchema: KeySentenceExtractionInputSchema,
    outputSchema: KeySentenceExtractionOutputSchema,
  },
  async input => {
    const {output} = await extractKeySentencesPrompt(input);
    return output!;
  }
);
