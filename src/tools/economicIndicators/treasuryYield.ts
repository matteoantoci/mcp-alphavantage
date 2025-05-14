import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

const treasuryYieldInputSchemaShape = {
  interval: z
    .enum(['daily', 'weekly', 'monthly'])
    .optional()
    .default('monthly')
    .describe('daily, weekly, or monthly (default: monthly)'),
  maturity: z
    .enum(['3month', '2year', '5year', '7year', '10year', '30year'])
    .optional()
    .default('10year')
    .describe('3month, 2year, 5year, 7year, 10year, or 30year (default: 10year)'),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of time series items to return. If not set, returns all available items.'),
};

type RawSchemaShape = typeof treasuryYieldInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const treasuryYieldHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  const { interval, maturity, limit } = input;
  const apiRequestParams: AlphaVantageApiParams = {
    apiFunction: 'TREASURY_YIELD',
    interval,
    maturity,
    datatype: 'json',
  };
  let data = await client.fetchApiData(apiRequestParams);
  if (data['Error Message']) throw new Error(data['Error Message']);

  // Apply limit if provided
  if (limit !== undefined && data.data && Array.isArray(data.data)) {
    data.data = data.data.slice(0, limit);
  }

  return data;
};

type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const treasuryYieldTool: AlphaVantageToolDefinition = {
  name: 'treasury_yield',
  description: 'Fetches daily, weekly, and monthly US treasury yield for a given maturity timeline.',
  inputSchemaShape: treasuryYieldInputSchemaShape,
  handler: treasuryYieldHandler,
};
