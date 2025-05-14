import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the AD tool
const adInputSchemaShape = {
  symbol: z.string().describe('The name of the ticker of your choice. For example: IBM'),
  interval: z
    .enum(['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'])
    .describe('Time interval between two consecutive data points.'),
  month: z
    .string()
    .optional()
    .describe('Query a specific month in history (YYYY-MM format). ONLY applicable to intraday intervals.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof adInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the AD tool
const adHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, interval, month } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'AD',
      symbol,
      interval,
      datatype: 'json',
    };

    if (month) {
      apiRequestParams.month = month;
    }

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('AD tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`AD tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const adTool: AlphaVantageToolDefinition = {
  name: 'ad',
  description: 'Fetches the Chaikin A/D line (AD) values.',
  inputSchemaShape: adInputSchemaShape,
  handler: adHandler,
};
