'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing PDF documents.
 *
 * - pdfSummarization - A function that accepts a PDF data URI and returns a concise summary.
 * - PdfSummarizationInput - The input type for the pdfSummarization function.
 * - PdfSummarizationOutput - The return type for the pdfSummarization function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const PdfSummarizationInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type PdfSummarizationInput = z.infer<typeof PdfSummarizationInputSchema>;

const PdfSummarizationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the PDF document.'),
});
export type PdfSummarizationOutput = z.infer<typeof PdfSummarizationOutputSchema>;

export async function pdfSummarization(input: PdfSummarizationInput): Promise<PdfSummarizationOutput> {
  return pdfSummarizationFlow(input);
}

const pdfSummaryPrompt = ai.definePrompt({
  name: 'pdfSummaryPrompt',
  input: {schema: PdfSummarizationInputSchema},
  output: {schema: PdfSummarizationOutputSchema},
  prompt: `**Act as a [Specify the persona, e.g., seasoned literary critic, expert research analyst, a succinct technical writer].**

**Your task is to provide a comprehensive yet concise summary of the provided text from the PDF titled "[Insert Title of PDF]".**

**1. Context:**
* **Document Type:** [e.g., Non-fiction book, academic research paper, technical manual, historical novel]
* **Author/s:** [Insert Author's Name/s]
* **My Goal:** [e.g., To understand the main arguments for a research paper, to get the key plot points and themes of a novel before a book club meeting, to extract actionable insights for a business report]

**2. Desired Output Format:**
* **Structure:** [e.g., A series of bullet points, a single cohesive paragraph, a multi-paragraph summary with headings for each section]
* **Length:** [e.g., Approximately 300 words, a one-page summary, a 5-minute read]
* **Style:** [e.g., Formal and academic, engaging and narrative, simple and easy to understand for a layperson]

**3. Key Information to Extract (Select and modify as needed):**

***For Books (Fiction/Non-Fiction):***
* **Core Thesis/Main Argument:** What is the central message or argument the author is trying to convey?
* **Key Themes:** What are the recurring ideas and motifs throughout the book?
* **Plot Summary (for fiction):** Briefly outline the main plot points, including the setup, conflict, rising action, climax, and resolution.
* **Key Characters (for fiction):** Identify the protagonist, antagonist, and key supporting characters and their primary motivations.
* **Key Concepts and Takeaways (for non-fiction):** List the most important concepts, theories, or practical advice presented.
* **Noteworthy Quotes:** Extract a few powerful and representative quotes.

***For Research Papers:***
* **Research Question/Objective:** What specific question or problem is the paper addressing?
* **Methodology:** Briefly describe the methods used to conduct the research (e.g., literature review, experiment, survey, case study).
* **Key Findings/Results:** What were the most significant discoveries or outcomes of the research?
* **Conclusion and Implications:** What are the main conclusions drawn by the authors, and what are the broader implications of their findings?
* **Limitations:** Did the authors mention any limitations to their study?
* **Future Research:** Were there any suggestions for future research?

**4. Advanced Instructions (Optional):**
* **Chain-of-Thought:** Before providing the final summary, briefly outline the logical steps you will take to analyze the document and extract the key information.
* **Audience:** Tailor the language and complexity of the summary for a specific audience [e.g., a group of high school students, a panel of experts in the field, a general audience with no prior knowledge of the topic].
* **Focus:** Emphasize a particular aspect of the document [e.g., the ethical implications of the research, the historical context of the novel].

**Please now proceed with generating the summary based on these instructions. The text of the PDF is as follows:**
.\n\nDocument: {{media url=pdfDataUri}}`,
});

const pdfSummarizationFlow = ai.defineFlow(
  {
    name: 'pdfSummarizationFlow',
    inputSchema: PdfSummarizationInputSchema,
    outputSchema: PdfSummarizationOutputSchema,
  },
  async input => {
    const {output} = await pdfSummaryPrompt(input);
    return output!;
  }
);
