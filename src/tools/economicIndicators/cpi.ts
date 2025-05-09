import { z } from 'zod';

const cpiInputSchemaShape = {
  interval: z.enum(['monthly', 'semiannual']).optional().default('monthly')
    .describe('monthly or semiannual (default: monthly)'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof cpiInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const cpiHandler = async (input: Input, apiKey: string): Promise<Output> => {
  // Removed datatype from input destructuring
  const { interval } = input;
  const params = new URLSearchParams({
    function: 'CPI',
    apikey: apiKey,
    interval,
    datatype: 'json', // Hardcoded datatype to 'json'
  });
  const url = `https://www.alphavantage.co/query?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
  // Removed CSV handling logic
  const data = await response.json();
  if (data['Error Message']) throw new Error(data['Error Message']);
  // Return raw data, wrapping is handled by wrapToolHandler
  return data;
};

type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

export const cpiTool: AlphaVantageToolDefinition = {
  name: 'cpi',
  description: 'Fetches monthly and semiannual consumer price index (CPI) of the United States.',
  inputSchemaShape: cpiInputSchemaShape,
  handler: cpiHandler,
};
