import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the EARNINGS_CALENDAR tool
const earningsCalendarInputSchemaShape = {
  symbol: z
    .string()
    .optional()
    .describe('If set, returns expected earnings for that specific symbol. Otherwise, returns the full list.'),
  horizon: z
    .enum(['3month', '6month', '12month'])
    .optional()
    .default('3month')
    .describe('By default, 3month. Query earnings scheduled for the next 3, 6, or 12 months.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof earningsCalendarInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the EARNINGS_CALENDAR tool
const earningsCalendarHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, horizon } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'EARNINGS_CALENDAR',
      horizon,
      datatype: 'json',
    };

    if (symbol) {
      apiRequestParams.symbol = symbol;
    }

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('EARNINGS_CALENDAR tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`EARNINGS_CALENDAR tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const earningsCalendarTool: AlphaVantageToolDefinition = {
  name: 'earnings_calendar',
  description: 'Fetches a list of company earnings expected in the next 3, 6, or 12 months.',
  inputSchemaShape: earningsCalendarInputSchemaShape,
  handler: earningsCalendarHandler,
};
