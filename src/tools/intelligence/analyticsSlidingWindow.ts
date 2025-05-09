import { z } from 'zod';

// Define the input schema shape for the ANALYTICS_SLIDING_WINDOW tool
const analyticsSlidingWindowInputSchemaShape = {
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
  window_size: z
    .number()
    .int()
    .positive()
    .min(10)
    .describe('An integer representing the size of the moving window (minimum 10).'),
  calculations: z.string().array().min(1).describe('A comma separated list of the analytics metrics to calculate.'),
  datatype: z
    .enum(['json', 'csv'])
    .optional()
    .default('json')
    .describe('By default, json. Strings json and csv are accepted.'),
};

type RawSchemaShape = typeof analyticsSlidingWindowInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the ANALYTICS_SLIDING_WINDOW tool
const analyticsSlidingWindowHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    const { symbols, range, interval, ohlc, window_size, calculations, datatype } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'ANALYTICS_SLIDING_WINDOW',
      SYMBOLS: symbols,
      INTERVAL: interval,
      OHLC: ohlc,
      WINDOW_SIZE: window_size.toString(),
      CALCULATIONS: calculations.join(','), // Join array of calculations into comma-separated string
      apikey: apiKey,
      datatype,
    });

    // Add range parameters - can be one or two
    range.forEach((r) => params.append('RANGE', r));

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
    console.error('ANALYTICS_SLIDING_WINDOW tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`ANALYTICS_SLIDING_WINDOW tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for ANALYTICS_SLIDING_WINDOW
export const analyticsSlidingWindowTool: AlphaVantageToolDefinition = {
  name: 'analytics_sliding_window',
  description: 'Fetches advanced analytics metrics for a given time series over sliding time windows.',
  inputSchemaShape: analyticsSlidingWindowInputSchemaShape,
  handler: analyticsSlidingWindowHandler,
};
