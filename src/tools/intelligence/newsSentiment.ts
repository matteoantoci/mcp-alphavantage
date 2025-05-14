import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the NEWS_SENTIMENT tool
const newsSentimentInputSchemaShape = {
  tickers: z
    .string()
    .optional()
    .describe(
      'Comma-separated stock/crypto/forex symbols. Filters for articles that simultaneously mention all provided tickers (e.g., "IBM" or "COIN,CRYPTO:BTC,FOREX:USD").'
    ),
  topics: z
    .string()
    .optional()
    .describe(
      'Comma-separated news topics. Filters for articles that simultaneously cover all provided topics (e.g., "technology" or "technology,ipo"). Supported topics: blockchain, earnings, ipo, mergers_and_acquisitions, financial_markets, economy_fiscal, economy_monetary, economy_macro, energy_transportation, finance, life_sciences, manufacturing, real_estate, retail_wholesale, technology.'
    ),
  time_from: z.string().optional().describe('The time range start (YYYYMMDDTHHMM format).'),
  time_to: z.string().optional().describe('The time range end (YYYYMMDDTHHMM format).'),
  sort: z.enum(['LATEST', 'EARLIEST', 'RELEVANCE']).optional().default('LATEST').describe('Sort order.'),
  limit: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(1000)
    .optional()
    .default(50)
    .describe('Maximum number of articles to return (up to 1000).'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof newsSentimentInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the NEWS_SENTIMENT tool
const newsSentimentHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const { tickers, topics, time_from, time_to, sort, limit } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'NEWS_SENTIMENT',
      sort,
      limit: limit?.toString() ?? '50',
      datatype: 'json',
    };

    if (tickers) {
      apiRequestParams.tickers = tickers;
    }
    if (topics) {
      apiRequestParams.topics = topics;
    }
    if (time_from) {
      apiRequestParams.time_from = time_from;
    }
    if (time_to) {
      apiRequestParams.time_to = time_to;
    }

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('NEWS_SENTIMENT tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`NEWS_SENTIMENT tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const newsSentimentTool: AlphaVantageToolDefinition = {
  name: 'news_sentiment',
  description: 'Fetches live and historical market news & sentiment data.',
  inputSchemaShape: newsSentimentInputSchemaShape,
  handler: newsSentimentHandler,
};
