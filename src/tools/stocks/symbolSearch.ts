import { z } from 'zod';

// Define the input schema shape for the SYMBOL_SEARCH tool
const symbolSearchInputSchemaShape = {
  keywords: z.string().describe('A text string of your choice. For example: microsoft.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof symbolSearchInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the SYMBOL_SEARCH tool
const symbolSearchHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    // Removed datatype from input destructuring
    const { keywords } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'SYMBOL_SEARCH',
      keywords,
      apikey: apiKey,
      datatype: 'json', // Hardcoded datatype to 'json'
    });

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
    console.error('SYMBOL_SEARCH tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
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
