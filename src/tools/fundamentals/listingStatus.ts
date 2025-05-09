import { z } from 'zod';

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
const listingStatusHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    // Removed datatype from input destructuring
    const { date, state } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'LISTING_STATUS',
      apikey: apiKey,
      state,
      datatype: 'json', // Hardcoded datatype to 'json'
    });

    if (date) {
      params.append('date', date);
    }

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
    console.error('LISTING_STATUS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
    throw new Error(`LISTING_STATUS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for LISTING_STATUS
export const listingStatusTool: AlphaVantageToolDefinition = {
  name: 'listing_status',
  description: 'Fetches a list of active or delisted US stocks and ETFs.',
  inputSchemaShape: listingStatusInputSchemaShape,
  handler: listingStatusHandler,
};
