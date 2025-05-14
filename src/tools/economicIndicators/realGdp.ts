import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

const realGdpInputSchemaShape = {
  interval: z
    .enum(['annual', 'quarterly'])
    .optional()
    .default('annual')
    .describe('annual or quarterly (default: annual)'),
  limit: z.number().positive().optional().describe('Maximum number of data points to return.'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof realGdpInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const realGdpHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  const { interval, limit } = input;
  const apiRequestParams: AlphaVantageApiParams = {
    apiFunction: 'REAL_GDP',
    interval,
    datatype: 'json',
  };
  let data = await client.fetchApiData(apiRequestParams);
  if (data['Error Message']) throw new Error(data['Error Message']);

  // Apply limit if provided
  if (limit && data.data && Array.isArray(data.data)) {
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

export const realGdpTool: AlphaVantageToolDefinition = {
  name: 'real_gdp',
  description: 'Fetches annual and quarterly Real GDP of the United States.',
  inputSchemaShape: realGdpInputSchemaShape,
  handler: realGdpHandler,
};
