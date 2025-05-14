import { z } from 'zod';
import BigNumber from 'bignumber.js';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Utility function to pipe data through a series of functions
const pipe = <T>(initialValue: T, ...fns: Array<(value: T) => T>): T =>
  fns.reduce((currentValue, fn) => fn(currentValue), initialValue);

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
  if (data['Note'] && data['Note'].includes('API call frequency')) {
    // Check for API limit note
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

// --- Filter Functions ---

const applyOptionTypeFilter = (
  data: OptionDataItem[],
  optionType: 'call' | 'put' | 'ALL' | undefined
): OptionDataItem[] => {
  if (optionType && optionType !== 'ALL') {
    return data.filter((item: OptionDataItem) => item.type === optionType);
  }
  return data;
};

const applyMinOpenInterestFilter = (data: OptionDataItem[], minOpenInterest: number | undefined): OptionDataItem[] => {
  if (minOpenInterest !== undefined) {
    const minOI = new BigNumber(minOpenInterest);
    return data.filter((item: OptionDataItem) => new BigNumber(item.open_interest).gte(minOI));
  }
  return data;
};

const applyMinVolumeFilter = (data: OptionDataItem[], minVolume: number | undefined): OptionDataItem[] => {
  if (minVolume !== undefined) {
    const minVol = new BigNumber(minVolume);
    return data.filter((item: OptionDataItem) => new BigNumber(item.volume).gte(minVol));
  }
  return data;
};

const applyExpirationFilter = (
  data: OptionDataItem[],
  expirationMonthsOffset: number | undefined,
  inputDate: string | undefined, // Date from tool input
  apiDataDate: string | undefined // Date from the first item in API response data (e.g., data.data[0].date)
): OptionDataItem[] => {
  if (expirationMonthsOffset === undefined) {
    return data; // No filter to apply
  }

  const baseDateStr = inputDate || apiDataDate;
  if (!baseDateStr) {
    console.warn('Expiration month offset filter skipped: Could not determine the base date for options data.');
    return data;
  }

  try {
    const queryDate = new Date(baseDateStr);
    // It's crucial to use UTC methods to avoid timezone shifts affecting month/day calculations
    queryDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC

    const startOfFilterPeriod = new Date(queryDate); // Options expiring on or after this date

    const endOfFilterPeriod = new Date(queryDate);
    // Set month to current month + offset
    endOfFilterPeriod.setUTCMonth(endOfFilterPeriod.getUTCMonth() + expirationMonthsOffset);
    // Set to the last day of that target month
    // Day 0 of the *next* month gives the last day of the *current* target month
    endOfFilterPeriod.setUTCMonth(endOfFilterPeriod.getUTCMonth() + 1, 0);
    endOfFilterPeriod.setUTCHours(23, 59, 59, 999); // End of that day in UTC

    return data.filter((item: OptionDataItem) => {
      const expirationDate = new Date(item.expiration);
      expirationDate.setUTCHours(0, 0, 0, 0); // Normalize for comparison
      return expirationDate >= startOfFilterPeriod && expirationDate <= endOfFilterPeriod;
    });
  } catch (e) {
    console.error('Error parsing dates for expiration filter:', e);
    return data; // Return original data if date parsing fails
  }
};

const applyStrikeProximityFilter = (
  data: OptionDataItem[],
  strikePriceProximityCount: number | undefined,
  currentStockPrice: number | undefined
): OptionDataItem[] => {
  if (strikePriceProximityCount === undefined || currentStockPrice === undefined) {
    return data; // Filter requires both parameters
  }

  const currentPrice = new BigNumber(currentStockPrice);
  const uniqueStrikes = Array.from(new Set(data.map((item: OptionDataItem) => new BigNumber(item.strike))));

  // Calculate difference and sort by difference
  const strikesWithDiff = uniqueStrikes
    .map((strike) => ({
      strike,
      diff: strike.minus(currentPrice).abs(),
    }))
    .sort((a, b) => a.diff.minus(b.diff).toNumber());

  // Take the top N strikes based on proximity count
  const numStrikesToInclude = 2 * strikePriceProximityCount + 1;
  const allowedStrikes = strikesWithDiff.slice(0, numStrikesToInclude).map((item) => item.strike);
  // Convert BigNumber strikes back to strings for comparison with item.strike
  const allowedStrikesStrings = allowedStrikes.map((strike) => strike.toString());

  return data.filter((item: OptionDataItem) => allowedStrikesStrings.includes(item.strike));
};

// Define the handler function for the HISTORICAL_OPTIONS tool
const historicalOptionsHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const {
      symbol,
      date: inputDateParam,
      strike_price_proximity_count,
      current_stock_price,
      expiration_months_offset,
      min_open_interest,
      min_volume,
      option_type,
    } = input;

    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'HISTORICAL_OPTIONS',
      symbol,
      datatype: 'json',
    };
    if (inputDateParam) {
      apiRequestParams.date = inputDateParam;
    }

    const apiResponseJson = await client.fetchApiData(apiRequestParams);

    // Log the raw API response data for debugging
    console.log('Raw Alpha Vantage API Response Data:', JSON.stringify(apiResponseJson, null, 2));

    // Check if data.data exists and is an array before proceeding
    if (!apiResponseJson.data || !Array.isArray(apiResponseJson.data)) {
      console.error(
        'Alpha Vantage API response did not contain an array in data.data or data was not an array:',
        apiResponseJson
      );
      const informativeMessage = getInformativeMessage(apiResponseJson); // Call global helper
      return {
        endpoint: apiResponseJson.endpoint || 'N/A',
        message: informativeMessage,
        data: [],
        filtered_count: 0,
        total_count: 0,
      };
    }

    const originalData: OptionDataItem[] = apiResponseJson.data;
    const apiDataDate = originalData.length > 0 ? originalData[0].date : undefined;

    // Create an array of filter functions, each pre-configured with its specific parameters
    const configuredFilterFunctions = [
      (currentData: OptionDataItem[]) => applyOptionTypeFilter(currentData, option_type),
      (currentData: OptionDataItem[]) => applyMinOpenInterestFilter(currentData, min_open_interest),
      (currentData: OptionDataItem[]) => applyMinVolumeFilter(currentData, min_volume),
      (currentData: OptionDataItem[]) =>
        applyExpirationFilter(currentData, expiration_months_offset, inputDateParam, apiDataDate),
      (currentData: OptionDataItem[]) =>
        applyStrikeProximityFilter(currentData, strike_price_proximity_count, current_stock_price),
    ];

    // Apply all filters using the pipe function
    const finalFilteredData = pipe(originalData, ...configuredFilterFunctions);

    // Return filtered data
    return {
      endpoint: apiResponseJson.endpoint,
      message: getInformativeMessage(apiResponseJson),
      data: finalFilteredData,
      filtered_count: finalFilteredData.length,
      total_count: originalData.length,
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
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const historicalOptionsTool: AlphaVantageToolDefinition = {
  name: 'historical_options',
  description:
    'Fetches historical options chain data for a symbol on a specific date, with optional filtering by strike proximity, expiration, open interest, volume, and option type.',
  inputSchemaShape: historicalOptionsInputSchemaShape,
  handler: historicalOptionsHandler,
};
