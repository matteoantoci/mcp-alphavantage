import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the TIME_SERIES_INTRADAY tool
const timeSeriesIntradayInputSchemaShape = {
  symbol: z.string().describe('The name of the equity of your choice. For example: IBM'),
  interval: z
    .enum(['1min', '5min', '15min', '30min', '60min'])
    .describe('Time interval between two consecutive data points.'),
  adjusted: z
    .boolean()
    .optional()
    .default(true)
    .describe('By default, true and the output time series is adjusted by historical split and dividend events.'),
  extended_hours: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'By default, true and the output time series will include both the regular trading hours and the extended trading hours.'
    ),
  month: z.string().optional().describe('Query a specific month in history (YYYY-MM format).'),
  outputsize: z
    .enum(['compact', 'full'])
    .optional()
    .default('compact')
    .describe(
      'By default, compact. Compact returns only the latest 100 data points; full returns trailing 30 days or full month history.'
    ),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of time series items to return. If not set, returns all available items.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof timeSeriesIntradayInputSchemaShape;
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

const timeSeriesIntradayHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, interval, adjusted, extended_hours, month, outputsize, limit } = input;

    // Build API params for AlphaVantageClient
    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'TIME_SERIES_INTRADAY',
      symbol,
      interval,
      adjusted: String(adjusted),
      extended_hours: String(extended_hours),
      outputsize: outputsize,
      datatype: 'json',
    };
    if (month) {
      apiRequestParams.month = month;
    }

    // Fetch data using the shared client
    const data = await client.fetchApiData(apiRequestParams);

    // Find the time series key (e.g., 'Time Series (5min)')
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
    console.error('TIME_SERIES_INTRADAY tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`TIME_SERIES_INTRADAY tool failed: ${message}`);
  }
};

type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const timeSeriesIntradayTool: AlphaVantageToolDefinition = {
  name: 'time_series_intraday',
  description: 'Fetches current and historical intraday OHLCV time series for a given stock/equity.',
  inputSchemaShape: timeSeriesIntradayInputSchemaShape,
  handler: timeSeriesIntradayHandler,
};
