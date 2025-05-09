import { z } from 'zod';

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
const earningsCalendarHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    // Removed datatype from input destructuring
    const { symbol, horizon } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'EARNINGS_CALENDAR',
      apikey: apiKey,
      horizon,
      datatype: 'json', // Hardcoded datatype to 'json'
    });

    if (symbol) {
      params.append('symbol', symbol);
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
    console.error('EARNINGS_CALENDAR tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
    throw new Error(`EARNINGS_CALENDAR tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for EARNINGS_CALENDAR
export const earningsCalendarTool: AlphaVantageToolDefinition = {
  name: 'earnings_calendar',
  description: 'Fetches a list of company earnings expected in the next 3, 6, or 12 months.',
  inputSchemaShape: earningsCalendarInputSchemaShape,
  handler: earningsCalendarHandler,
};
