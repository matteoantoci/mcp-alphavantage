import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the TIME_SERIES_WEEKLY tool
const timeSeriesWeeklyInputSchemaShape = {
  symbol: z.string().describe('The name of the equity of your choice. For example: IBM'),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of time series items to return. If not set, returns all available items.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof timeSeriesWeeklyInputSchemaShape;
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

// Define the handler function for the TIME_SERIES_WEEKLY tool
const timeSeriesWeeklyHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, limit } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'TIME_SERIES_WEEKLY',
      symbol,
      datatype: 'json',
    };

    const data = await client.fetchApiData(apiRequestParams);

    // Find the time series key (e.g., 'Weekly Time Series')
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
    console.error('TIME_SERIES_WEEKLY tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`TIME_SERIES_WEEKLY tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const timeSeriesWeeklyTool: AlphaVantageToolDefinition = {
  name: 'time_series_weekly',
  description: 'Fetches weekly OHLCV time series for a given stock/equity.',
  inputSchemaShape: timeSeriesWeeklyInputSchemaShape,
  handler: timeSeriesWeeklyHandler,
};
