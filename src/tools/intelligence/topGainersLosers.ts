// Define the input schema shape for the TOP_GAINERS_LOSERS tool
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

const topGainersLosersInputSchemaShape = {}; // No required parameters

type RawSchemaShape = typeof topGainersLosersInputSchemaShape;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the TOP_GAINERS_LOSERS tool
const topGainersLosersHandler = async (client: AlphaVantageClient): Promise<Output> => {
  try {
    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'TOP_GAINERS_LOSERS',
    };

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('TOP_GAINERS_LOSERS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`TOP_GAINERS_LOSERS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (client: AlphaVantageClient) => Promise<Output>;
};

export const topGainersLosersTool: AlphaVantageToolDefinition = {
  name: 'top_gainers_losers',
  description: 'Fetches the top 20 gainers, losers, and most actively traded tickers in the US market.',
  inputSchemaShape: topGainersLosersInputSchemaShape,
  handler: topGainersLosersHandler,
};
