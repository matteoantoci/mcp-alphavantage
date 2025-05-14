import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the SYMBOL_SEARCH tool
const symbolSearchInputSchemaShape = {
  keywords: z.string().describe('A text string of your choice. For example: microsoft.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof symbolSearchInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the SYMBOL_SEARCH tool
const symbolSearchHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { keywords } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'SYMBOL_SEARCH',
      keywords,
      datatype: 'json',
    };

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('SYMBOL_SEARCH tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`SYMBOL_SEARCH tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const symbolSearchTool: AlphaVantageToolDefinition = {
  name: 'symbol_search',
  description: 'Searches for the best-matching stock symbols based on keywords.',
  inputSchemaShape: symbolSearchInputSchemaShape,
  handler: symbolSearchHandler,
};
