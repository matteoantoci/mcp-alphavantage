import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the DIVIDENDS tool
const dividendsInputSchemaShape = {
  symbol: z.string().describe('The symbol of the ticker of your choice. For example: IBM.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof dividendsInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the DIVIDENDS tool
const dividendsHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'DIVIDENDS',
      symbol,
      datatype: 'json',
    };

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('DIVIDENDS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`DIVIDENDS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const dividendsTool: AlphaVantageToolDefinition = {
  name: 'company_dividends',
  description: 'Fetches historical and future (declared) dividend distributions.',
  inputSchemaShape: dividendsInputSchemaShape,
  handler: dividendsHandler,
};
