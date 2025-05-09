import { z } from 'zod';

// Define the input schema shape for the NEWS_SENTIMENT tool
const newsSentimentInputSchemaShape = {
  tickers: z
    .string()
    .optional()
    .describe('Comma-separated stock/crypto/forex symbols (e.g., IBM,COIN,CRYPTO:BTC,FOREX:USD).'),
  topics: z.string().optional().describe('Comma-separated news topics (e.g., technology,ipo).'),
  time_from: z.string().optional().describe('The time range start (YYYYMMDDTHHMM format).'),
  time_to: z.string().optional().describe('The time range end (YYYYMMDDTHHMM format).'),
  sort: z.enum(['LATEST', 'EARLIEST', 'RELEVANCE']).optional().default('LATEST').describe('Sort order.'),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .default(50)
    .describe('Maximum number of articles to return (up to 1000).'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof newsSentimentInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the NEWS_SENTIMENT tool
const newsSentimentHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    // Removed datatype from input destructuring
    const { tickers, topics, time_from, time_to, sort, limit } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'NEWS_SENTIMENT',
      apikey: apiKey,
      sort,
      limit: limit.toString(),
      datatype: 'json', // Hardcoded datatype to 'json'
    });

    if (tickers) {
      params.append('tickers', tickers);
    }
    if (topics) {
      params.append('topics', topics);
    }
    if (time_from) {
      params.append('time_from', time_from);
    }
    if (time_to) {
      params.append('time_to', time_to);
    }

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

    // Return raw data, wrapping is handled by wrapToolHandler
    return data;
  } catch (error: unknown) {
    console.error('NEWS_SENTIMENT tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Throw the error, wrapping is handled by wrapToolHandler
    throw new Error(`NEWS_SENTIMENT tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for NEWS_SENTIMENT
export const newsSentimentTool: AlphaVantageToolDefinition = {
  name: 'news_sentiment',
  description: 'Fetches live and historical market news & sentiment data.',
  inputSchemaShape: newsSentimentInputSchemaShape,
  handler: newsSentimentHandler,
};
