import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

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
const timeSeriesDailyHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, outputsize, limit } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'TIME_SERIES_DAILY',
      symbol,
      outputsize,
      datatype: 'json',
    };

    const data = await client.fetchApiData(apiRequestParams);

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

    return limitedData;
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
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const timeSeriesDailyTool: AlphaVantageToolDefinition = {
  name: 'time_series_daily',
  description: 'Fetches raw daily OHLCV time series for a given stock/equity.',
  inputSchemaShape: timeSeriesDailyInputSchemaShape,
  handler: timeSeriesDailyHandler,
};
