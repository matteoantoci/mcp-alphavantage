import { z } from 'zod';

// Define the input schema shape for the TIME_SERIES_DAILY tool
const timeSeriesDailyInputSchemaShape = {
  symbol: z.string().describe('The name of the equity of your choice. For example: IBM'),
  outputsize: z
    .enum(['compact', 'full'])
    .optional()
    .default('compact')
    .describe(
      'By default, compact. Compact returns only the latest 100 data points; full returns the full-length time series.'
    ),
  datatype: z
    .enum(['json', 'csv'])
    .optional()
    .default('json')
    .describe('By default, json. Strings json and csv are accepted.'),
};

type RawSchemaShape = typeof timeSeriesDailyInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the TIME_SERIES_DAILY tool
const timeSeriesDailyHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    const { symbol, outputsize, datatype } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'TIME_SERIES_DAILY',
      symbol,
      apikey: apiKey,
      outputsize,
      datatype,
    });

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
    console.error('TIME_SERIES_DAILY tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`TIME_SERIES_DAILY tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for TIME_SERIES_DAILY
export const timeSeriesDailyTool: AlphaVantageToolDefinition = {
  name: 'time_series_daily',
  description: 'Fetches raw daily OHLCV time series for a given equity.',
  inputSchemaShape: timeSeriesDailyInputSchemaShape,
  handler: timeSeriesDailyHandler,
};
