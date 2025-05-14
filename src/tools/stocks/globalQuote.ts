import { z } from 'zod';

// Define the input schema shape for the GLOBAL_QUOTE tool
const globalQuoteInputSchemaShape = {
  symbol: z.string().describe('The symbol of the global ticker of your choice. For example: IBM.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof globalQuoteInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

import type { AlphaVantageClient } from '../../alphaVantageClient.js';

// Define the handler function for the GLOBAL_QUOTE tool
const globalQuoteHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol } = input;
    const data = await client.fetchApiData({
      apiFunction: 'GLOBAL_QUOTE',
      symbol,
    });
    return data;
  } catch (error: unknown) {
    console.error('GLOBAL_QUOTE tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`GLOBAL_QUOTE tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

// Export the tool definition for GLOBAL_QUOTE
export const globalQuoteTool: AlphaVantageToolDefinition = {
  name: 'stock_quote',
  description: 'Fetches the latest stock price and volume information for a stock ticker.',
  inputSchemaShape: globalQuoteInputSchemaShape,
  handler: globalQuoteHandler,
};
