import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

const durablesInputSchemaShape = {
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of time series items to return. If not set, returns all available items.'),
};

type RawSchemaShape = typeof durablesInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;

type DurablesDataItem = {
  date: string;
  value: string;
};

type DurablesApiResponse = {
  metadata?: Record<string, string>;
  data?: DurablesDataItem[];
  'Error Message'?: string;
};

type Output = DurablesApiResponse;

const durablesHandler = async (input: Input, client: AlphaVantageClient): Promise<Output> => {
  const { limit } = input;
  const apiRequestParams: AlphaVantageApiParams = {
    apiFunction: 'DURABLES',
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

export const durablesTool: AlphaVantageToolDefinition = {
  name: 'durables',
  description: "Fetches monthly manufacturers' new orders of durable goods in the United States.",
  inputSchemaShape: durablesInputSchemaShape,
  handler: durablesHandler,
};
