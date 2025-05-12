// Define the input schema shape for the MARKET_STATUS tool
const marketStatusInputSchemaShape = {}; // No required parameters

type RawSchemaShape = typeof marketStatusInputSchemaShape;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the MARKET_STATUS tool
const marketStatusHandler = async (apiKey: string): Promise<Output> => {
  try {
    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'MARKET_STATUS',
      apikey: apiKey,
    });

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    // Handle JSON response (Market Status is only available in JSON)
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
    console.error('MARKET_STATUS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
    throw new Error(`MARKET_STATUS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (apiKey: string) => Promise<Output>;
};

// Export the tool definition for MARKET_STATUS
export const marketStatusTool: AlphaVantageToolDefinition = {
  name: 'market_status',
  description: 'Fetches the current market status (open vs. closed) of major stock trading venues.',
  inputSchemaShape: marketStatusInputSchemaShape,
  handler: marketStatusHandler,
};
