import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the LISTING_STATUS tool
const listingStatusInputSchemaShape = {
  date: z
    .string()
    .optional()
    .describe(
      'If set, the API will return a list of active or delisted symbols on that date in history (YYYY-MM-DD format).'
    ),
  state: z
    .enum(['active', 'delisted'])
    .optional()
    .default('active')
    .describe('By default, active. Set to delisted to query delisted assets.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof listingStatusInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the LISTING_STATUS tool
const listingStatusHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { date, state } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'LISTING_STATUS',
      state,
      datatype: 'json',
    };

    if (date) {
      apiRequestParams.date = date;
    }

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('LISTING_STATUS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`LISTING_STATUS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const listingStatusTool: AlphaVantageToolDefinition = {
  name: 'listing_status',
  description: 'Fetches a list of active or delisted US stocks and ETFs.',
  inputSchemaShape: listingStatusInputSchemaShape,
  handler: listingStatusHandler,
};
