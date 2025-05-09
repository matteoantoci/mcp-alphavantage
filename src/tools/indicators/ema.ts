import { z } from 'zod';

// Define the input schema shape for the EMA tool
const emaInputSchemaShape = {
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
  datatype: z
    .enum(['json', 'csv'])
    .optional()
    .default('json')
    .describe('By default, json. Strings json and csv are accepted.'),
};

type RawSchemaShape = typeof emaInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the EMA tool
const emaHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    const { symbol, interval, month, time_period, series_type, datatype } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'EMA',
      symbol,
      interval,
      time_period: time_period.toString(),
      series_type,
      apikey: apiKey,
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
    console.error('EMA tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`EMA tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for EMA
export const emaTool: AlphaVantageToolDefinition = {
  name: 'ema',
  description: 'Fetches the exponential moving average (EMA) values.',
  inputSchemaShape: emaInputSchemaShape,
  handler: emaHandler,
};
