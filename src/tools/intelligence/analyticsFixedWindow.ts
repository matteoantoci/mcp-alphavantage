import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the ANALYTICS_FIXED_WINDOW tool
const analyticsFixedWindowInputSchemaShape = {
  symbols: z
    .string()
    .describe('A comma separated list of symbols for the calculation (up to 5 for free API, 50 for premium).'),
  range: z
    .string()
    .array()
    .min(1)
    .max(2)
    .describe(
      'The date range for the series being requested. Can be text values (e.g., "full", "1year") or two dates (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).'
    ),
  interval: z
    .enum(['1min', '5min', '15min', '30min', '60min', 'DAILY', 'WEEKLY', 'MONTHLY'])
    .describe('Time interval between two consecutive data points.'),
  ohlc: z
    .enum(['open', 'high', 'low', 'close'])
    .optional()
    .default('close')
    .describe('Which OHLC field the calculation will be performed on.'),
  calculations: z.string().array().min(1).describe('A comma separated list of the analytics metrics to calculate.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof analyticsFixedWindowInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the ANALYTICS_FIXED_WINDOW tool
const analyticsFixedWindowHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbols, range, interval, ohlc, calculations } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'ANALYTICS_FIXED_WINDOW',
      SYMBOLS: symbols,
      INTERVAL: interval,
      OHLC: ohlc,
      CALCULATIONS: calculations.join(','),
      datatype: 'json',
    };

    // Add range parameters - can be one or two
    if (Array.isArray(range)) {
      apiRequestParams.RANGE = range.join(',');
    }

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('ANALYTICS_FIXED_WINDOW tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`ANALYTICS_FIXED_WINDOW tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const analyticsFixedWindowTool: AlphaVantageToolDefinition = {
  name: 'analytics_fixed_window',
  description: 'Fetches advanced analytics metrics for a given time series over a fixed temporal window.',
  inputSchemaShape: analyticsFixedWindowInputSchemaShape,
  handler: analyticsFixedWindowHandler,
};
