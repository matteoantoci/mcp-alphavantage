import { z } from 'zod';

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

const realGdpHandler = async (input: Input, apiKey: string): Promise<Output> => {
  // Removed datatype from input destructuring
  const { interval, limit } = input; // Added limit
  const params = new URLSearchParams({
    function: 'REAL_GDP',
    apikey: apiKey,
    interval,
    datatype: 'json', // Hardcoded datatype to 'json'
  });
  const url = `https://www.alphavantage.co/query?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
  // Removed CSV handling logic
  let data = await response.json(); // Changed to let
  if (data['Error Message']) throw new Error(data['Error Message']);

  // Apply limit if provided
  if (limit && data.data && Array.isArray(data.data)) {
    data.data = data.data.slice(0, limit);
  }

  // Return raw data, wrapping is handled by wrapToolHandler
  return data;
};

type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

export const realGdpTool: AlphaVantageToolDefinition = {
  name: 'real_gdp',
  description: 'Fetches annual and quarterly Real GDP of the United States.',
  inputSchemaShape: realGdpInputSchemaShape,
  handler: realGdpHandler,
};
