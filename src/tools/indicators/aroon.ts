import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the AROON tool
const aroonInputSchemaShape = {
  symbol: z.string().describe('The name of the ticker of your choice. For example: IBM'),
  interval: z
    .enum(['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'])
    .describe('Time interval between two consecutive data points.'),
  month: z
    .string()
    .optional()
    .describe('Query a specific month in history (YYYY-MM format). ONLY applicable to intraday intervals.'),
  time_period: z.number().int().positive().describe('Number of data points used to calculate each AROON value.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof aroonInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the AROON tool
const aroonHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, interval, month, time_period } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'AROON',
      symbol,
      interval,
      time_period: time_period.toString(),
      datatype: 'json',
    };

    if (month) {
      apiRequestParams.month = month;
    }

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('AROON tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`AROON tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const aroonTool: AlphaVantageToolDefinition = {
  name: 'aroon',
  description: 'Fetches the Aroon (AROON) values.',
  inputSchemaShape: aroonInputSchemaShape,
  handler: aroonHandler,
};
