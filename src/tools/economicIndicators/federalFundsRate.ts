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
};

type RawSchemaShape = typeof federalFundsRateInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const federalFundsRateHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  const { interval, limit } = input;
  const apiRequestParams: AlphaVantageApiParams = {
    apiFunction: 'FEDERAL_FUNDS_RATE',
    interval,
    datatype: 'json',
  };
  const data = await client.fetchApiData(apiRequestParams);
  if (data['Error Message']) throw new Error(data['Error Message']);

  // Apply limit if provided without mutating original data
  const resultData =
    limit !== undefined && data.data && Array.isArray(data.data) ? { ...data, data: data.data.slice(0, limit) } : data;

  return resultData;
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
