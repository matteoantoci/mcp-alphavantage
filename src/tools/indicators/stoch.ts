import { z } from 'zod';

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
  datatype: z
    .enum(['json', 'csv'])
    .optional()
    .default('json')
    .describe('By default, json. Strings json and csv are accepted.'),
};

type RawSchemaShape = typeof stochInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the STOCH tool
const stochHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    const { symbol, interval, month, fastkperiod, slowkperiod, slowdperiod, slowkmatype, slowdmatype, datatype } =
      input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'STOCH',
      symbol,
      interval,
      apikey: apiKey,
      fastkperiod: fastkperiod.toString(),
      slowkperiod: slowkperiod.toString(),
      slowdperiod: slowdperiod.toString(),
      slowkmatype: slowkmatype.toString(),
      slowdmatype: slowdmatype.toString(),
      datatype,
    });

    if (month) {
      params.append('month', month);
    }

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    // Handle CSV response
    if (datatype === 'csv') {
      const csvData = await response.text();
      return { data: csvData, format: 'csv' };
    }

    // Handle JSON response
    const data = await response.json();

    // Check for Alpha Vantage API errors (e.g., API limit, invalid parameters)
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage API Error: ${data['Error Message']}`);
    }
    if (data['Note']) {
      console.warn(`Alpha Vantage API Note: ${data['Note']}`);
    }

    return { data, format: 'json' };
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
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for STOCH
export const stochTool: AlphaVantageToolDefinition = {
  name: 'stoch',
  description: 'Fetches the stochastic oscillator (STOCH) values.',
  inputSchemaShape: stochInputSchemaShape,
  handler: stochHandler,
};
