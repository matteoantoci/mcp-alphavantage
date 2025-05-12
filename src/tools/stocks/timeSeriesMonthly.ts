import { z } from 'zod';

// Define the input schema shape for the TIME_SERIES_MONTHLY tool
const timeSeriesMonthlyInputSchemaShape = {
  symbol: z.string().describe('The name of the equity of your choice. For example: IBM'),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of time series items to return. If not set, returns all available items.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof timeSeriesMonthlyInputSchemaShape;
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

// Define the handler function for the TIME_SERIES_MONTHLY tool
const timeSeriesMonthlyHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    // Removed datatype from input destructuring
    const { symbol, limit } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'TIME_SERIES_MONTHLY',
      symbol,
      apikey: apiKey,
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

    // Find the time series key (e.g., 'Monthly Time Series')
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
    console.error('TIME_SERIES_MONTHLY tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
    throw new Error(`TIME_SERIES_MONTHLY tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for TIME_SERIES_MONTHLY
export const timeSeriesMonthlyTool: AlphaVantageToolDefinition = {
  name: 'time_series_monthly',
  description: 'Fetches monthly OHLCV time series for a given stock/equity.',
  inputSchemaShape: timeSeriesMonthlyInputSchemaShape,
  handler: timeSeriesMonthlyHandler,
};
