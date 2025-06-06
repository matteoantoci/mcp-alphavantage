import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

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

// Helper function to extract the list of transactions from the API response
const extractTransactionsList = (apiResponse: any): any[] => {
  if (Array.isArray(apiResponse)) {
    return apiResponse;
  }
  if (apiResponse && typeof apiResponse === 'object' && apiResponse.data && Array.isArray(apiResponse.data)) {
    return apiResponse.data;
  }
  console.warn('Insider transactions data not found or not in expected array format. API Response:', apiResponse);
  return []; // Return empty array for unexpected structures
};

// Helper function to filter transactions by date range
const filterTransactionsByDate = (transactions: any[], startDate?: string, endDate?: string): any[] => {
  if (!startDate && !endDate) {
    return transactions; // No filtering needed
  }

  return transactions.filter((transaction: any) => {
    if (!transaction.transaction_date) {
      console.warn('Transaction date property not found on transaction object:', transaction);
      return false;
    }

    const transactionTimestamp = Date.parse(transaction.transaction_date);
    if (isNaN(transactionTimestamp)) {
      console.warn(`Failed to parse transaction date: ${transaction.transaction_date}`);
      return false;
    }

    let startFilterActive = false;
    let endFilterActive = false;
    let includeByStartDate = true;
    let includeByEndDate = true;

    if (startDate) {
      const filterStartTimestamp = Date.parse(startDate);
      if (!isNaN(filterStartTimestamp)) {
        startFilterActive = true;
        includeByStartDate = transactionTimestamp >= filterStartTimestamp;
      } else {
        console.warn(`Failed to parse start date: ${startDate}`);
      }
    }

    if (endDate) {
      const filterEndTimestamp = Date.parse(endDate + 'T23:59:59.999Z'); // End of the specified day in UTC
      if (!isNaN(filterEndTimestamp)) {
        endFilterActive = true;
        includeByEndDate = transactionTimestamp <= filterEndTimestamp;
      } else {
        console.warn(`Failed to parse end date: ${endDate}`);
      }
    }

    // If no valid date filters were actually parsed and activated, include the transaction
    // This handles cases where startDate or endDate were provided but were invalid.
    // If both are invalid, all transactions pass the date filter.
    // If one is valid and one invalid, only the valid one applies.
    if (!startFilterActive && !endFilterActive && (startDate || endDate)) {
      return true;
    }

    return includeByStartDate && includeByEndDate;
  });
};

// Define the handler function for the INSIDER_TRANSACTIONS tool
const insiderTransactionsHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { symbol, startDate, endDate } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'INSIDER_TRANSACTIONS',
      symbol,
      datatype: 'json',
    };

    const apiResponse = await client.fetchApiData(apiRequestParams);

    const transactionsList = extractTransactionsList(apiResponse);

    if (transactionsList.length === 0 && (startDate || endDate)) {
      return [];
    }

    return filterTransactionsByDate(transactionsList, startDate, endDate);
  } catch (error: unknown) {
    console.error('INSIDER_TRANSACTIONS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`INSIDER_TRANSACTIONS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const insiderTransactionsTool: AlphaVantageToolDefinition = {
  name: 'insider_transactions',
  description: 'Fetches the latest and historical insider transactions for a company.',
  inputSchemaShape: insiderTransactionsInputSchemaShape,
  handler: insiderTransactionsHandler,
};
