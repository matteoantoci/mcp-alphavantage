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
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of time series items to return. If not set, returns all available items.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof timeSeriesDailyInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;

// Define a basic output type for time series data
type TimeSeriesOutput = {
  'Meta Data': { [key: string]: string };
  [timeSeriesKey: string]:
    | {
        [timestamp: string]: {
          '1. open': string;
          '2. high': string;
          '3. low': string;
          '4. close': string;
          '5. volume': string;
        };
      }
    | { [key: string]: string }; // Allow for 'Meta Data' and potential error messages
};

type Output = TimeSeriesOutput;

// Define the handler function for the TIME_SERIES_DAILY tool
const timeSeriesDailyHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    // Removed datatype from input destructuring
    const { symbol, outputsize, limit } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'TIME_SERIES_DAILY',
      symbol,
      apikey: apiKey,
      outputsize,
      datatype: 'json', // Hardcoded datatype to 'json'
    });

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

    // Find the time series key (e.g., 'Time Series (Daily)')
    const timeSeriesKey = Object.keys(data).find((key) => key.includes('Time Series'));
    const timeSeriesData = timeSeriesKey ? data[timeSeriesKey] : undefined;

    // Apply limit if provided and time series data exists
    const limitedData = {
      ...data,
      ...(timeSeriesKey && timeSeriesData && typeof limit === 'number' && limit > 0
        ? {
            [timeSeriesKey]: Object.fromEntries(Object.entries(timeSeriesData).slice(0, limit)),
          }
        : {}),
    };

    // Return the potentially limited data, wrapping is handled by wrapToolHandler
    return limitedData;
  } catch (error: unknown) {
    console.error('TIME_SERIES_DAILY tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
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
  description: 'Fetches raw daily OHLCV time series for a given stock/equity.',
  inputSchemaShape: timeSeriesDailyInputSchemaShape,
  handler: timeSeriesDailyHandler,
};
