import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the SMA tool
const smaInputSchemaShape = {
  symbol: z.string().describe('The name of the ticker of your choice. For example: IBM'),
  interval: z
    .enum(['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'])
    .describe('Time interval between two consecutive data points.'),
  month: z
    .string()
    .optional()
    .describe('Query a specific month in history (YYYY-MM format). ONLY applicable to intraday intervals.'),
  time_period: z
    .number()
    .int()
    .positive()
    .describe('Number of data points used to calculate each moving average value.'),
  series_type: z.enum(['close', 'open', 'high', 'low']).describe('The desired price type in the time series.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof smaInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the SMA tool
const smaHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, interval, month, time_period, series_type } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'SMA',
      symbol,
      interval,
      time_period: time_period.toString(),
      series_type,
      datatype: 'json',
    };

    if (month) {
      apiRequestParams.month = month;
    }

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('SMA tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`SMA tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const smaTool: AlphaVantageToolDefinition = {
  name: 'sma',
  description: 'Fetches the simple moving average (SMA) values.',
  inputSchemaShape: smaInputSchemaShape,
  handler: smaHandler,
};
