import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the INCOME_STATEMENT tool
const incomeStatementInputSchemaShape = {
  symbol: z.string().describe('The symbol of the ticker of your choice. For example: IBM.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof incomeStatementInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the INCOME_STATEMENT tool
const incomeStatementHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'INCOME_STATEMENT',
      symbol,
      datatype: 'json',
    };

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('INCOME_STATEMENT tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`INCOME_STATEMENT tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const incomeStatementTool: AlphaVantageToolDefinition = {
  name: 'income_statement',
  description: 'Fetches annual and quarterly income statements for a company.',
  inputSchemaShape: incomeStatementInputSchemaShape,
  handler: incomeStatementHandler,
};
