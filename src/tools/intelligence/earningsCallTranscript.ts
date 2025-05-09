import { z } from 'zod';

// Define the input schema shape for the EARNINGS_CALL_TRANSCRIPT tool
const earningsCallTranscriptInputSchemaShape = {
  symbol: z.string().describe('The symbol of the ticker of your choice. For example: IBM.'),
  quarter: z.string().describe('Fiscal quarter in YYYYQM format. For example: 2024Q1.'),
  datatype: z
    .enum(['json', 'csv'])
    .optional()
    .default('json')
    .describe('By default, json. Strings json and csv are accepted.'),
};

type RawSchemaShape = typeof earningsCallTranscriptInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the EARNINGS_CALL_TRANSCRIPT tool
const earningsCallTranscriptHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    const { symbol, quarter, datatype } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'EARNINGS_CALL_TRANSCRIPT',
      symbol,
      quarter,
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
    console.error('EARNINGS_CALL_TRANSCRIPT tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`EARNINGS_CALL_TRANSCRIPT tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for EARNINGS_CALL_TRANSCRIPT
export const earningsCallTranscriptTool: AlphaVantageToolDefinition = {
  name: 'earnings_call_transcript',
  description: 'Fetches the earnings call transcript for a given company in a specific quarter.',
  inputSchemaShape: earningsCallTranscriptInputSchemaShape,
  handler: earningsCallTranscriptHandler,
};
