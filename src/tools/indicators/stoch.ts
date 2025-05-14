import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the STOCH tool
const stochInputSchemaShape = {
  symbol: z.string().describe('The name of the ticker of your choice. For example: IBM'),
  interval: z
    .enum(['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'])
    .describe('Time interval between two consecutive data points.'),
  month: z
    .string()
    .optional()
    .describe('Query a specific month in history (YYYY-MM format). ONLY applicable to intraday intervals.'),
  fastkperiod: z
    .number()
    .int()
    .positive()
    .optional()
    .default(5)
    .describe('The time period of the fastk moving average.'),
  slowkperiod: z
    .number()
    .int()
    .positive()
    .optional()
    .default(3)
    .describe('The time period of the slowk moving average.'),
  slowdperiod: z
    .number()
    .int()
    .positive()
    .optional()
    .default(3)
    .describe('The time period of the slowd moving average.'),
  slowkmatype: z
    .number()
    .int()
    .min(0)
    .max(8)
    .optional()
    .default(0)
    .describe('Moving average type for the slowk moving average (0=SMA, 1=EMA, etc.).'),
  slowdmatype: z
    .number()
    .int()
    .min(0)
    .max(8)
    .optional()
    .default(0)
    .describe('Moving average type for the slowd moving average (0=SMA, 1=EMA, etc.).'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof stochInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the STOCH tool
const stochHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, interval, month, fastkperiod, slowkperiod, slowdperiod, slowkmatype, slowdmatype } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'STOCH',
      symbol,
      interval,
      fastkperiod: fastkperiod.toString(),
      slowkperiod: slowkperiod.toString(),
      slowdperiod: slowdperiod.toString(),
      slowkmatype: slowkmatype.toString(),
      slowdmatype: slowdmatype.toString(),
      datatype: 'json',
    };

    if (month) {
      apiRequestParams.month = month;
    }

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('STOCH tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`STOCH tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const stochTool: AlphaVantageToolDefinition = {
  name: 'stoch',
  description: 'Fetches the stochastic oscillator (STOCH) values.',
  inputSchemaShape: stochInputSchemaShape,
  handler: stochHandler,
};
