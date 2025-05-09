import { z } from 'zod';

// Define the input schema shape for the EARNINGS tool
const earningsInputSchemaShape = {
  symbol: z.string().describe('The symbol of the ticker of your choice. For example: IBM.'),
  datatype: z
    .enum(['json', 'csv'])
    .optional()
    .default('json')
    .describe('By default, json. Strings json and csv are accepted.'),
};

type RawSchemaShape = typeof earningsInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the EARNINGS tool
const earningsHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    const { symbol, datatype } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'EARNINGS',
      symbol,
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
    console.error('EARNINGS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`EARNINGS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for EARNINGS
export const earningsTool: AlphaVantageToolDefinition = {
  name: 'company_earnings',
  description: 'Fetches annual and quarterly earnings (EPS) for a company.',
  inputSchemaShape: earningsInputSchemaShape,
  handler: earningsHandler,
};
