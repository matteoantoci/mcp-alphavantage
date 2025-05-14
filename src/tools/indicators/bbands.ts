import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the BBANDS tool
const bbandsInputSchemaShape = {
  symbol: z.string().describe('The name of the ticker of your choice. For example: IBM'),
  interval: z
    .enum(['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'])
    .describe('Time interval between two consecutive data points.'),
  month: z
    .string()
    .optional()
    .describe('Query a specific month in history (YYYY-MM format). ONLY applicable to intraday intervals.'),
  time_period: z.number().int().positive().describe('Number of data points used to calculate each BBANDS value.'),
  series_type: z.enum(['close', 'open', 'high', 'low']).describe('The desired price type in the time series.'),
  nbdevup: z.number().positive().optional().default(2).describe('The standard deviation multiplier of the upper band.'),
  nbdevdn: z.number().positive().optional().default(2).describe('The standard deviation multiplier of the lower band.'),
  matype: z
    .number()
    .int()
    .min(0)
    .max(8)
    .optional()
    .default(0)
    .describe('Moving average type of the time series (0=SMA, 1=EMA, etc.).'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof bbandsInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the BBANDS tool
const bbandsHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, interval, month, time_period, series_type, nbdevup, nbdevdn, matype } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'BBANDS',
      symbol,
      interval,
      time_period: time_period.toString(),
      series_type,
      nbdevup: nbdevup.toString(),
      nbdevdn: nbdevdn.toString(),
      matype: matype.toString(),
      datatype: 'json',
    };

    if (month) {
      apiRequestParams.month = month;
    }

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('BBANDS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`BBANDS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const bbandsTool: AlphaVantageToolDefinition = {
  name: 'bbands',
  description: 'Fetches the Bollinger bands (BBANDS) values.',
  inputSchemaShape: bbandsInputSchemaShape,
  handler: bbandsHandler,
};
