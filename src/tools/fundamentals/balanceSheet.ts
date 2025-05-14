import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the BALANCE_SHEET tool
const balanceSheetInputSchemaShape = {
  symbol: z.string().describe('The symbol of the ticker of your choice. For example: IBM.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof balanceSheetInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the BALANCE_SHEET tool
const balanceSheetHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'BALANCE_SHEET',
      symbol,
      datatype: 'json',
    };

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('BALANCE_SHEET tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`BALANCE_SHEET tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const balanceSheetTool: AlphaVantageToolDefinition = {
  name: 'balance_sheet',
  description: 'Fetches annual and quarterly balance sheets for a company.',
  inputSchemaShape: balanceSheetInputSchemaShape,
  handler: balanceSheetHandler,
};
