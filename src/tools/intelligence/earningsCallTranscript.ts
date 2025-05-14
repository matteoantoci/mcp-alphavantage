import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the EARNINGS_CALL_TRANSCRIPT tool
const earningsCallTranscriptInputSchemaShape = {
  symbol: z.string().describe('The symbol of the ticker of your choice. For example: IBM.'),
  quarter: z.string().describe('Fiscal quarter in YYYYQM format. For example: 2024Q1.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof earningsCallTranscriptInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the EARNINGS_CALL_TRANSCRIPT tool
const earningsCallTranscriptHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, quarter } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'EARNINGS_CALL_TRANSCRIPT',
      symbol,
      quarter,
      datatype: 'json',
    };

    const data = await client.fetchApiData(apiRequestParams);

    return data;
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
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const earningsCallTranscriptTool: AlphaVantageToolDefinition = {
  name: 'earnings_call_transcript',
  description: 'Fetches the earnings call transcript for a given company in a specific quarter.',
  inputSchemaShape: earningsCallTranscriptInputSchemaShape,
  handler: earningsCallTranscriptHandler,
};
