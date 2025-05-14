import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

const retailSalesInputSchemaShape = {
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of time series items to return. If not set, returns all available items.'),
};

type RawSchemaShape = typeof retailSalesInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const retailSalesHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  const { limit } = input;
  const apiRequestParams: AlphaVantageApiParams = {
    apiFunction: 'RETAIL_SALES',
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

export const retailSalesTool: AlphaVantageToolDefinition = {
  name: 'retail_sales',
  description: 'Fetches monthly Advance Retail Sales: Retail Trade data of the United States.',
  inputSchemaShape: retailSalesInputSchemaShape,
  handler: retailSalesHandler,
};
