import { z } from 'zod';

// Define the input schema shape for the INSIDER_TRANSACTIONS tool
const insiderTransactionsInputSchemaShape = {
  symbol: z.string().describe('The symbol of the ticker of your choice. For example: IBM.'),
  startDate: z.string().optional().describe('The start date for filtering transactions (YYYY-MM-DD).'),
  endDate: z.string().optional().describe('The end date for filtering transactions (YYYY-MM-DD).'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof insiderTransactionsInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the INSIDER_TRANSACTIONS tool
const insiderTransactionsHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    // Removed datatype from input destructuring
    // Added startDate and endDate to input destructuring
    const { symbol, startDate, endDate } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'INSIDER_TRANSACTIONS',
      symbol,
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

    // Filter data if startDate or endDate are provided
    let filteredData = data;
    if (Array.isArray(data) && (startDate || endDate)) {
      filteredData = data.filter((transaction: any) => {
        if (!transaction.transaction_date) return false;
        const transactionDate = new Date(transaction.transaction_date);
        if (startDate && transactionDate < new Date(startDate)) {
          return false;
        }
        if (endDate && transactionDate > new Date(endDate)) {
          return false;
        }
        return true;
      });
    }

    // Return filtered data, wrapping is handled by wrapToolHandler
    return filteredData;
  } catch (error: unknown) {
    console.error('INSIDER_TRANSACTIONS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
    throw new Error(`INSIDER_TRANSACTIONS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for INSIDER_TRANSACTIONS
export const insiderTransactionsTool: AlphaVantageToolDefinition = {
  name: 'insider_transactions',
  description: 'Fetches the latest and historical insider transactions for a company.',
  inputSchemaShape: insiderTransactionsInputSchemaShape,
  handler: insiderTransactionsHandler,
};
