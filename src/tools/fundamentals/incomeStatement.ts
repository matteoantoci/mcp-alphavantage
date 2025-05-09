import { z } from 'zod';

// Define the input schema shape for the INCOME_STATEMENT tool
const incomeStatementInputSchemaShape = {
  symbol: z.string().describe('The symbol of the ticker of your choice. For example: IBM.'),
  datatype: z
    .enum(['json', 'csv'])
    .optional()
    .default('json')
    .describe('By default, json. Strings json and csv are accepted.'),
};

type RawSchemaShape = typeof incomeStatementInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the INCOME_STATEMENT tool
const incomeStatementHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    const { symbol, datatype } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'INCOME_STATEMENT',
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
    console.error('INCOME_STATEMENT tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`INCOME_STATEMENT tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for INCOME_STATEMENT
export const incomeStatementTool: AlphaVantageToolDefinition = {
  name: 'income_statement',
  description: 'Fetches annual and quarterly income statements for a company.',
  inputSchemaShape: incomeStatementInputSchemaShape,
  handler: incomeStatementHandler,
};
