import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the ETF_PROFILE tool
const etfProfileInputSchemaShape = {
  symbol: z.string().describe('The symbol of the ticker of your choice. For example: QQQ.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof etfProfileInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the ETF_PROFILE tool
const etfProfileHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'ETF_PROFILE',
      symbol,
      datatype: 'json',
    };

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('ETF_PROFILE tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`ETF_PROFILE tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const etfProfileTool: AlphaVantageToolDefinition = {
  name: 'etf_profile',
  description: 'Fetches key ETF metrics and holdings.',
  inputSchemaShape: etfProfileInputSchemaShape,
  handler: etfProfileHandler,
};
