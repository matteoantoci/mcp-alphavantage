import { z } from 'zod';

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
const analyticsFixedWindowHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    // Removed datatype from input destructuring
    const { symbols, range, interval, ohlc, calculations } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'ANALYTICS_FIXED_WINDOW',
      SYMBOLS: symbols,
      INTERVAL: interval,
      OHLC: ohlc,
      CALCULATIONS: calculations.join(','), // Join array of calculations into comma-separated string
      apikey: apiKey,
      datatype: 'json', // Hardcoded datatype to 'json'
    });

    // Add range parameters - can be one or two
    range.forEach((r) => params.append('RANGE', r));

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    // Removed CSV handling logic

    // Handle JSON response
    const data = await response.json();

    // Check for Alpha Vantage API errors (e.g., API limit, invalid parameters)
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage API Error: ${data['Error Message']}`);
    }
    if (data['Note']) {
      console.warn(`Alpha Vantage API Note: ${data['Note']}`);
    }

    // Return raw data, wrapping is handled by wrapToolHandler
    return data;
  } catch (error: unknown) {
    console.error('ANALYTICS_FIXED_WINDOW tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
    throw new Error(`ANALYTICS_FIXED_WINDOW tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for ANALYTICS_FIXED_WINDOW
export const analyticsFixedWindowTool: AlphaVantageToolDefinition = {
  name: 'analytics_fixed_window',
  description: 'Fetches advanced analytics metrics for a given time series over a fixed temporal window.',
  inputSchemaShape: analyticsFixedWindowInputSchemaShape,
  handler: analyticsFixedWindowHandler,
};
