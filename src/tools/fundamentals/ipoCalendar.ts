import { z } from 'zod';

// Define the input schema shape for the IPO_CALENDAR tool
const ipoCalendarInputSchemaShape = {
  datatype: z
    .enum(['json', 'csv'])
    .optional()
    .default('csv')
    .describe('By default, csv. Strings json and csv are accepted.'),
};

type RawSchemaShape = typeof ipoCalendarInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the IPO_CALENDAR tool
const ipoCalendarHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    const { datatype } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'IPO_CALENDAR',
      apikey: apiKey,
      datatype,
    });

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    // Handle CSV response
    if (datatype === 'csv') {
      const csvData = await response.text();
      return { data: csvData, format: 'csv' };
    }

    // Handle JSON response
    const data = await response.json();

    // Check for Alpha Vantage API errors (e.g., API limit, invalid parameters)
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage API Error: ${data['Error Message']}`);
    }
    if (data['Note']) {
      console.warn(`Alpha Vantage API Note: ${data['Note']}`);
    }

    return { data, format: 'json' };
  } catch (error: unknown) {
    console.error('IPO_CALENDAR tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`IPO_CALENDAR tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for IPO_CALENDAR
export const ipoCalendarTool: AlphaVantageToolDefinition = {
  name: 'ipo_calendar',
  description: 'Fetches a list of IPOs expected in the next 3 months.',
  inputSchemaShape: ipoCalendarInputSchemaShape,
  handler: ipoCalendarHandler,
};
