import { z } from 'zod';

// Define the input schema shape for the HISTORICAL_OPTIONS tool
const historicalOptionsInputSchemaShape = {
  symbol: z.string().describe('The name of the equity of your choice. For example: IBM'),
  date: z
    .string()
    .optional()
    .describe(
      'The date for which to retrieve options data (YYYY-MM-DD format). Defaults to the previous trading session.'
    ),
  // Removed datatype parameter
};

type RawSchemaShape = typeof historicalOptionsInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the HISTORICAL_OPTIONS tool
const historicalOptionsHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    // Removed datatype from input destructuring
    const { symbol, date } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'HISTORICAL_OPTIONS',
      symbol,
      apikey: apiKey,
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
    console.error('HISTORICAL_OPTIONS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
    throw new Error(`HISTORICAL_OPTIONS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for HISTORICAL_OPTIONS
export const historicalOptionsTool: AlphaVantageToolDefinition = {
  name: 'historical_options',
  description: 'Fetches the full historical options chain for a specific symbol on a specific date.',
  inputSchemaShape: historicalOptionsInputSchemaShape,
  handler: historicalOptionsHandler,
};
