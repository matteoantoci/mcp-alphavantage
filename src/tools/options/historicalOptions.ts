import { z } from 'zod';
import BigNumber from 'bignumber.js';

// Define the input schema shape for the HISTORICAL_OPTIONS tool
const historicalOptionsInputSchemaShape = {
  symbol: z.string().describe('The name of the equity of your choice. For example: IBM'),
  date: z
    .string()
    .optional()
    .describe(
      'The date for which to retrieve options data (YYYY-MM-DD format). Defaults to the previous trading session.'
    ),
  strike_price_proximity_count: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      'Number of strike prices to include above and below the current_stock_price. Requires current_stock_price to be provided.'
    ),
  current_stock_price: z
    .number()
    .positive()
    .optional()
    .describe(
      'The current price of the underlying stock, used for strike_price_proximity_count filter. Will be handled as BigNumber internally.'
    ),
  expiration_months_offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      'Include expirations from the query date up to this many months in the future. E.g., 0 for current month, 1 for current + next month.'
    ),
  min_open_interest: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Minimum open interest for an option contract to be included. Will be handled as BigNumber internally.'),
  min_volume: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Minimum daily volume for an option contract to be included. Will be handled as BigNumber internally.'),
  option_type: z
    .enum(['call', 'put', 'ALL'])
    .optional()
    .default('ALL')
    .describe('Filter by option type (call, put, or ALL).'),
};

type RawSchemaShape = typeof historicalOptionsInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;

// Define a type for the individual option data items based on the API response example
interface OptionDataItem {
  contractID: string;
  symbol: string;
  expiration: string;
  strike: string; // Comes as string from API
  type: 'call' | 'put';
  last: string; // Comes as string from API
  mark: string; // Comes as string from API
  bid: string; // Comes as string from API
  bid_size: string; // Comes as string from API
  ask: string; // Comes as string from API
  ask_size: string; // Comes as string from API
  volume: string; // Comes as string from API
  open_interest: string; // Comes as string from API
  date: string; // Comes as string from API
  implied_volatility: string; // Comes as string from API
  delta: string; // Comes as string from API
  gamma: string; // Comes as string from API
  theta: string; // Comes as string from API
  vega: string; // Comes as string from API
  rho: string; // Comes as string from API
}

// Define the output type based on the expected filtered data structure
interface HistoricalOptionsOutput {
  endpoint: string;
  message: string;
  data: OptionDataItem[]; // Array of filtered option data items
  filtered_count: number;
  total_count: number;
}

type Output = HistoricalOptionsOutput;

// Helper function to get an informative message from the API response
const getInformativeMessage = (data: any): string => {
    if (data['Error Message']) {
        return `Alpha Vantage API Error: ${data['Error Message']}`;
    }
    if (data['Note'] && data['Note'].includes('API call frequency')) { // Check for API limit note
        return `Alpha Vantage API Note: ${data['Note']}`;
    }
    if (data.message && !(data['Error Message'] || (data['Note'] && data['Note'].includes('API call frequency')))) {
        // Use data.message only if it's not an error or API limit note,
        // and it's likely the success message from the API.
        return data.message;
    }
    // Default if data.data is missing and no other specific message is found
    if (!data.data || !Array.isArray(data.data)) {
        return 'API response missing data array or data is not an array.';
    }
    // If data.data exists but somehow we still ended up here (shouldn't happen with current logic)
    return 'An unexpected issue occurred while processing the API response.';
};


// Define the handler function for the HISTORICAL_OPTIONS tool
const historicalOptionsHandler = async (input: Input, apiKey: string): Promise<Output> => {
  try {
    const {
      symbol,
      date,
      strike_price_proximity_count,
      current_stock_price,
      expiration_months_offset,
      min_open_interest,
      min_volume,
      option_type,
    } = input;

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: 'HISTORICAL_OPTIONS',
      symbol,
      apikey: apiKey,
      datatype: 'json', // Hardcoded datatype to 'json'
    });

    if (date) {
      params.append('date', date);
    }

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Log the raw API response data for debugging
    console.log('Raw Alpha Vantage API Response Data:', JSON.stringify(data, null, 2));

    // Check for Alpha Vantage API errors (e.g., API limit, invalid parameters)
    // These are now primarily handled by getInformativeMessage if data.data is missing
    if (data['Error Message'] && (data.data && Array.isArray(data.data))) {
      // If data.data IS present, but there's still an error message, throw it.
      throw new Error(`Alpha Vantage API Error: ${data['Error Message']}`);
    }
    if (data['Note'] && (data.data && Array.isArray(data.data))) {
      // If data.data IS present, but there's a note, log it.
      console.warn(`Alpha Vantage API Note: ${data['Note']}`);
    }


    // Check if data.data exists and is an array before proceeding
    if (!data.data || !Array.isArray(data.data)) {
        console.error('Alpha Vantage API response did not contain an array in data.data or data was not an array:', data);
        const informativeMessage = getInformativeMessage(data); // Call global helper
        return {
            endpoint: data.endpoint || 'N/A',
            message: informativeMessage,
            data: [],
            filtered_count: 0,
            total_count: 0,
        };
    }

    let filteredData: OptionDataItem[] = data.data;

    // Apply filters sequentially
    if (option_type && option_type !== 'ALL') {
      filteredData = filteredData.filter((item: OptionDataItem) => item.type === option_type);
    }

    if (min_open_interest !== undefined) {
      const minOI = new BigNumber(min_open_interest);
      filteredData = filteredData.filter((item: OptionDataItem) => new BigNumber(item.open_interest).gte(minOI));
    }

    if (min_volume !== undefined) {
      const minVol = new BigNumber(min_volume);
      filteredData = filteredData.filter((item: OptionDataItem) => new BigNumber(item.volume).gte(minVol));
    }

    if (expiration_months_offset !== undefined) {
      const baseDate = date ? new Date(date) : filteredData.length > 0 ? new Date(filteredData[0].date) : new Date();
      const targetMonth = new Date(baseDate);
      targetMonth.setMonth(targetMonth.getMonth() + expiration_months_offset);

      filteredData = filteredData.filter((item: OptionDataItem) => {
        const expirationDate = new Date(item.expiration);
        // Include options from the base month up to the target month (inclusive)
        return expirationDate >= baseDate && expirationDate <= targetMonth;
      });
    }

    if (strike_price_proximity_count !== undefined && current_stock_price !== undefined) {
      const currentPrice = new BigNumber(current_stock_price);
      const uniqueStrikes = Array.from(new Set(filteredData.map((item: OptionDataItem) => new BigNumber(item.strike))));

      // Calculate difference and sort by difference
      const strikesWithDiff = uniqueStrikes.map(strike => ({
        strike,
        diff: strike.minus(currentPrice).abs()
      }));
      strikesWithDiff.sort((a, b) => a.diff.minus(b.diff).toNumber());

      // Take the top N strikes based on proximity count
      const numStrikesToInclude = 2 * strike_price_proximity_count + 1;
      const allowedStrikes = strikesWithDiff.slice(0, numStrikesToInclude).map(item => item.strike);
      const allowedStrikesStrings = allowedStrikes.map((strike) => strike.toFixed());

      filteredData = filteredData.filter((item: OptionDataItem) => allowedStrikesStrings.includes(item.strike));
    }

    // Return filtered data
    return {
      endpoint: data.endpoint,
      message: getInformativeMessage(data), // Use helper for success message too if appropriate
      data: filteredData,
      filtered_count: filteredData.length,
      total_count: data.data ? data.data.length : 0, // data.data should exist here
    };
  } catch (error: unknown) {
    console.error('HISTORICAL_OPTIONS tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`HISTORICAL_OPTIONS tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

// Export the tool definition for HISTORICAL_OPTIONS
export const historicalOptionsTool: AlphaVantageToolDefinition = {
  name: 'historical_options',
  description:
    'Fetches historical options chain data for a symbol on a specific date, with optional filtering by strike proximity, expiration, open interest, volume, and option type.',
  inputSchemaShape: historicalOptionsInputSchemaShape,
  handler: historicalOptionsHandler,
};
