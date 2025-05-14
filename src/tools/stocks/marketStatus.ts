// Define the input schema shape for the MARKET_STATUS tool
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

const marketStatusInputSchemaShape = {}; // No required parameters

type RawSchemaShape = typeof marketStatusInputSchemaShape;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the MARKET_STATUS tool
const marketStatusHandler = async (client: AlphaVantageClient): Promise<Output> => {
  try {
    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'MARKET_STATUS',
    };

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('MARKET_STATUS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`MARKET_STATUS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (client: AlphaVantageClient) => Promise<Output>;
};

export const marketStatusTool: AlphaVantageToolDefinition = {
  name: 'market_status',
  description: 'Fetches the current market status (open vs. closed) of major stock trading venues.',
  inputSchemaShape: marketStatusInputSchemaShape,
  handler: marketStatusHandler,
};
