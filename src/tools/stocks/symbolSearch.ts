import { z } from 'zod';

// Define the input schema shape for the SYMBOL_SEARCH tool
const symbolSearchInputSchemaShape = {
  keywords: z.string().describe('A text string of your choice. For example: microsoft.'),
  datatype: z
    .enum(['json', 'csv'])
    .optional()
    .default('json')
    .describe('By default, json. Strings json and csv are accepted.'),
};

type RawSchemaShape = typeof symbolSearchInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the SYMBOL_SEARCH tool
const symbolSearchHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    const { keywords, datatype } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'SYMBOL_SEARCH',
      keywords,
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
    console.error('SYMBOL_SEARCH tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`SYMBOL_SEARCH tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for SYMBOL_SEARCH
export const symbolSearchTool: AlphaVantageToolDefinition = {
  name: 'symbol_search',
  description: 'Searches for the best-matching symbols based on keywords.',
  inputSchemaShape: symbolSearchInputSchemaShape,
  handler: symbolSearchHandler,
};
