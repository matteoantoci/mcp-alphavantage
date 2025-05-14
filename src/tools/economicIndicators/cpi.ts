import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

const cpiInputSchemaShape = {
  interval: z
    .enum(['monthly', 'semiannual'])
    .optional()
    .default('monthly')
    .describe('monthly or semiannual (default: monthly)'),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of time series items to return. If not set, returns all available items.'),
};

type RawSchemaShape = typeof cpiInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;

type CpiDataItem = {
  date: string;
  value: string;
};

type CpiApiResponse = {
  metadata?: Record<string, string>;
  data?: CpiDataItem[];
  'Error Message'?: string;
};

type Output = CpiApiResponse;

const cpiHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  const { interval, limit } = input;
  const apiRequestParams: AlphaVantageApiParams = {
    apiFunction: 'CPI',
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

export const cpiTool: AlphaVantageToolDefinition = {
  name: 'cpi',
  description: 'Fetches monthly and semiannual consumer price index (CPI) of the United States.',
  inputSchemaShape: cpiInputSchemaShape,
  handler: cpiHandler,
};
