import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

const federalFundsRateInputSchemaShape = {
  interval: z
    .enum(['daily', 'weekly', 'monthly'])
    .optional()
    .default('monthly')
    .describe('daily, weekly, or monthly (default: monthly)'),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of time series items to return. If not set, returns all available items.'),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be in YYYY-MM-DD format')
    .optional()
    .describe("Filter data from this date onwards (YYYY-MM-DD format). Applied after 'limit'."),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be in YYYY-MM-DD format')
    .optional()
    .describe("Filter data up to this date (YYYY-MM-DD format). Applied after 'limit'."),
};

type RawSchemaShape = typeof federalFundsRateInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;

interface FederalFundsRateDataPoint {
  date: string;
  value: string;
}

interface FederalFundsRateOutput {
  name: string;
  interval: string;
  unit: string;
  data: FederalFundsRateDataPoint[];
  [key: string]: any; // Allow other properties
}

type Output = FederalFundsRateOutput;

const federalFundsRateHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  const { interval, limit, startDate, endDate } = input;
  const apiRequestParams: AlphaVantageApiParams = {
    apiFunction: 'FEDERAL_FUNDS_RATE',
    interval,
    datatype: 'json',
  };
  const rawApiData: FederalFundsRateOutput = await client.fetchApiData(apiRequestParams);
  if (rawApiData['Error Message']) throw new Error(rawApiData['Error Message']);

  // Ensure 'data' property exists and is an array before processing
  const baseDataArray = Array.isArray(rawApiData?.data) ? rawApiData.data : [];

  // Apply limit
  const limitedDataArray = limit !== undefined ? baseDataArray.slice(0, limit) : baseDataArray;

  // Apply startDate filter
  const startDateFilteredArray = startDate
    ? limitedDataArray.filter((item: FederalFundsRateDataPoint) => item.date >= startDate)
    : limitedDataArray;

  // Apply endDate filter
  const finalDataArray = endDate
    ? startDateFilteredArray.filter((item: FederalFundsRateDataPoint) => item.date <= endDate)
    : startDateFilteredArray;

  // Reconstruct the final output object, preserving other properties from rawApiData
  const result: FederalFundsRateOutput = {
    ...rawApiData, // Spread other potential top-level properties from the API response
    data: finalDataArray,
  };

  return result;
};

type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const federalFundsRateTool: AlphaVantageToolDefinition = {
  name: 'federal_funds_rate',
  description: 'Fetches daily, weekly, and monthly federal funds rate (interest rate) of the United States.',
  inputSchemaShape: federalFundsRateInputSchemaShape,
  handler: federalFundsRateHandler,
};
