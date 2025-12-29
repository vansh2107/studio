'use server';

/**
 * @fileOverview A flow that visualizes changes in user asset values using AI to determine the best chart type.
 *
 * - visualizeAssetChanges - A function that handles the visualization of asset changes.
 * - VisualizeAssetChangesInput - The input type for the visualizeAssetChanges function.
 * - VisualizeAssetChangesOutput - The return type for the visualizeAssetChanges function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeAssetChangesInputSchema = z.object({
  assetChanges: z.string().describe('A description of changes in user asset values over time.'),
});

export type VisualizeAssetChangesInput = z.infer<
  typeof VisualizeAssetChangesInputSchema
>;

const VisualizeAssetChangesOutputSchema = z.object({
  chartType: z
    .string()
    .describe(
      'The recommended chart type (e.g., line chart, bar chart, pie chart) for visualizing the asset changes.'
    ),
  reason: z
    .string()
    .describe(
      'The reasoning behind the recommended chart type, explaining why it is suitable for the given data.'
    ),
});

export type VisualizeAssetChangesOutput = z.infer<
  typeof VisualizeAssetChangesOutputSchema
>;

export async function visualizeAssetChanges(
  input: VisualizeAssetChangesInput
): Promise<VisualizeAssetChangesOutput> {
  return visualizeAssetChangesFlow(input);
}

const visualizeAssetChangesPrompt = ai.definePrompt({
  name: 'visualizeAssetChangesPrompt',
  input: {schema: VisualizeAssetChangesInputSchema},
  output: {schema: VisualizeAssetChangesOutputSchema},
  prompt: `You are an expert data visualization consultant. Given the following description of asset changes, recommend the best chart type to visualize the data and explain your reasoning.\n\nAsset Changes Description: {{{assetChanges}}}\n\nChart Type: \nReason: `,
});

const visualizeAssetChangesFlow = ai.defineFlow(
  {
    name: 'visualizeAssetChangesFlow',
    inputSchema: VisualizeAssetChangesInputSchema,
    outputSchema: VisualizeAssetChangesOutputSchema,
  },
  async input => {
    const {output} = await visualizeAssetChangesPrompt(input);
    return output!;
  }
);
