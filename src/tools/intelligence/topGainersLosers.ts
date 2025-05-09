// Define the input schema shape for the TOP_GAINERS_LOSERS tool
const topGainersLosersInputSchemaShape = {}; // No required parameters

type RawSchemaShape = typeof topGainersLosersInputSchemaShape;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the TOP_GAINERS_LOSERS tool
const topGainersLosersHandler = async (apiKey: string): Promise<Output> => {
  try {
    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'TOP_GAINERS_LOSERS',
      apikey: apiKey,
    });

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    // Handle JSON response (only available in JSON)
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
    console.error('TOP_GAINERS_LOSERS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
    throw new Error(`TOP_GAINERS_LOSERS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (apiKey: string) => Promise<Output>;
};

// Export the tool definition for TOP_GAINERS_LOSERS
export const topGainersLosersTool: AlphaVantageToolDefinition = {
  name: 'top_gainers_losers',
  description: 'Fetches the top 20 gainers, losers, and most actively traded tickers in the US market.',
  inputSchemaShape: topGainersLosersInputSchemaShape,
  handler: topGainersLosersHandler,
};
